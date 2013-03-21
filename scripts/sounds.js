var sounds = {};
sounds.music = {};

sounds.music.intro = new Howl ({
    urls: ['sounds/music/intro.mp3', 'sounds/music/intro.ogg'],
    autoplay: true,
    buffer: true,
    loop: true
});
/*sounds.music = new Howl({
	urls: ['http://gandzo.com/meow/asteroid/ambient.mp3', 'http://gandzo.com/meow/asteroid/ambient.ogg'],
	autoplay: true,
	buffer: true,
	loop: true
});

sounds.laser = new Howl ({
	urls: ['http://gandzo.com/meow/asteroid/laserSound.wav'],
	volume: 0.2,
	autoplay: false
});

sounds.explosion = new Howl ({
	urls: ['http://gandzo.com/meow/asteroid/explosionSound.wav'],
	volume: 0.3,
	autoplay: false
});

sounds.playerExplosion = new Howl ({
	urls: ['http://gandzo.com/meow/asteroid/playerexplosion.mp3', 'http://gandzo.com/meow/asteroid/playerexplosion.ogg'],
	autoplay: false
});
    */