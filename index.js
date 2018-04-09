const discord = require( 'discord.js' );
const express = require( 'express' );
const countdown = require( 'countdown' );

const router = express.Router();
const client = new discord.Client( { fetchAllMembers: true } );

//  //  //  Discord

client.on( 'ready', () => {
	console.log( `Logged in as ${ client.user.tag }!` );
} );

client.login(process.env.BOT_TOKEN);

//  //  //  Express

router.get( '/', handler );
router.get( '/sort/:sort', handler );

module.exports = router;

function handler( req, res ) {
	var sort = req.params.sort;

	if ( !sort ) sort = 'createdAt';

	try {
		var array = client.guilds.find( 'id', process.env.TARGET_SERVER )
			.members.map( member => {
				return {
					name: member.user.username,
					nick: member.nickname,
					created: betterDate( member.user.createdAt ),
					joined: betterDate( member.joinedAt ),
					createdAt: member.user.createdAt,
					joinedAt: member.joinedAt,
					diff: countdown( member.user.createdAt, member.joinedAt ),
				};
			} )
			.sort( sortMethods[ sort ] );

	} catch (e) {
		console.log( e );
	}

	res.render( 'index', { title: 'Express', array } );
}

function betterDate( date ) {
	var d = ( new Date( date ) ).toISOString().replace( /T/, ' ' );
	return d.substring( 0, d.length - 8 );
}

var sortMethods = {
	name:( a, b ) => returnTextCompare( 'name' ),
	nick: ( a, b ) => returnTextCompare( 'nick' ),
	createdAt:( a, b ) => b.createdAt - a.createdAt,
	joinedAt: ( a, b ) => b.joinedAt - a.joinedAt,
	diff: ( a, b ) => a.diff.value - b.diff.value,
};

function returnTextCompare( prop ) {
	return function( a, b ) {
		var A = a[ prop ].toUpperCase();
		var B = b[ prop ].toUpperCase();

		if ( A < B ) return -1;
		if ( A > B ) return 1;

		return 0;
	}
}
