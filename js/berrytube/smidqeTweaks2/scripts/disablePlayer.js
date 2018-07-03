function load() {
	const self = {
		//will be enabled if maltweaks is not loaded
		
		functions: ['videoPlay','videoPlaying','videoPause','videoPaused','videoSeekTo','videoLoadAtTime','videoGetTime','videoGetState','removeCurrentPlayer','videoSeeked','videoSeeked','manageDrinks'],
		backup: {},
		hide: () => {
			if (window.MT)
			{
				window.MT.disablePlayer();
				return;
			}
		},
		show: () => {
			if (window.MT)
			{
				window.MT.restoreLocalPlayer();
				return;
			}
		},
		enable: () => {
			
		},
		disable: () => {

		},
	};

	return self;
}
