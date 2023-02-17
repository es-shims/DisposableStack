'use strict';

module.exports = function NewDisposeCapability() {
	var stack = []; // step 1
	return { '[[DisposableResourceStack]]': stack }; // step 2
};
