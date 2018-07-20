function load() {
	const self = {
		//will be enabled if maltweaks is not loaded
		
		functions: ['videoPlay','videoPlaying','videoPause','videoPaused','videoSeekTo','videoLoadAtTime','videoGetTime','videoGetState','removeCurrentPlayer','videoSeeked','videoSeeked','manageDrinks'],
		backup: {},
		hide: () => {
			if (window.MT)
				return window.MT.disablePlayer();

		},
		show: () => {
			if (window.MT)
				return window.MT.restoreLocalPlayer();
		},
		enable: () => {
			
		},
		disable: () => {

		},
	};

	return self;
}
