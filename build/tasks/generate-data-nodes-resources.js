var gulp = require("gulp");
var jsonfile = require('jsonfile');
var _ = require('lodash');
var replace = require('gulp-replace');

jsonfile.spaces = 2;

var resourceTemplate = require("../../src/datanodes/data-node-template.json");
var allowedValues = require('../allowedValues.json');
var vmResource = _(resourceTemplate.resources).find(function(r) { return r.type == "Microsoft.Compute/virtualMachines"});
var dataDiskTemplate = vmResource.properties.storageProfile.dataDisks[0];
var nthDisk = function(i) {
  var d = _.cloneDeep(dataDiskTemplate);
  d.lun = i;
  d.name = d.name.replace(/_INDEX_/, i + 1);
  d.vhd.Uri = d.vhd.Uri.replace(/_INDEX_/, i + 1);
  return d;
}

gulp.task("generate-data-nodes-resource", function(cb) {
  var cbCalled = 0;
  var done =function() {
    cbCalled++;
    if (cbCalled == allowedValues.dataDisks.length) cb();
  };

  allowedValues.dataDisks.forEach(function (size) {
    var t = _.cloneDeep(resourceTemplate);
    var vm = _(t.resources).find(function(r) { return r.type == "Microsoft.Compute/virtualMachines"});
    vm.properties.storageProfile.dataDisks = _.range(size).map(nthDisk);
    var resource = "../src/datanodes/data-node-" + size + "disk-resources.json";
    jsonfile.writeFile(resource, t, { flag: 'w' },function (err) {
      done();
    });
  });
});
