/*
	Will be a collection of various functions/patches to wutShot
	
*/

function load() {
	const self = {
		meta: {
			
		},
		enabled: false,

		enable: () => {
			self.enabled = true;
		},
		disable: () => {
			self.enabled = false;
		},

		//create the listeners
		init: () => {

		}
	}

	return self;
}
SmidqeTweaks.add(load())
