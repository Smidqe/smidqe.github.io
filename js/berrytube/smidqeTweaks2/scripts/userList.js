/*
	This script will group the chatlist
		-> each group will have name, count on their list
			-> ? possibly be able to expand the user to include other things
			-> 
		-> admins
		->
		
*/
function load() {
	const self = {
		build: () => {
			$('#chatlist').append(
				self.chat.groups().map((index, elem) => {
					return $('<div>', {
						id: 'st-userlist-group-' + elem,
						class: 'st-userlist-group'
					})
					.append(
						$('<div>', {
							id: 'st-titlebar-' + elem,
							class: 'st-titlebar'
						}).append(
							$('<span>', {text: elem}),
							$('<span>', {text: 'Count'})
						),
						$('#chatlist .' + elem)
					)
				})
			);
		},
		move: (data) => {
			
		},
		remove: () => {

		},
		enable: () => {
			self.build();
			
			self.chat.listen('userJoin', self.move);
			self.chat.listen('userPart', self.remove);
		},
		disable: () => {

		},
		init: () => {
			self.chat = SmidqeTweaks.get('chat');
		}
	}


	return self;
}

SmidqeTweaks.add(load());
