// Model/View JS

var Model = {
	jp: {
		vocab: {
			index: 1,
			ls: [],
			words: []
		}
	}
};

var View = {
	jp: {
		vocab: {
			render_list: function() {
				$( ".jp.vocab" ).removeClass( "loading" );
				var words = M.jp.vocab.words;
				for ( var i=0; i<words.length; i++ ) {
					var el = document.createElement( "div" )
						, word = words[i].kj.split( "," ).join( "" )
						, reading = words[i].fg.split( "," ).join( "" )
						, type = words[i].t
						, def = words[i].d
						, html = word + " " + reading + " " +  "(" + type + ") " + def + "<br>";
					el.innerHTML = html;
					el.setAttribute( "class", "word" );
					el.setAttribute( "data-index", words[i].i );
					if ( words[i].fl !== undefined ) {
						el.setAttribute( "data-src", "local" );
					}
					$( ".jp.vocab .vocab-list" ).append( el );
					if ( i===words.length-1 ) {
						$( ".jp.vocab .vocab-list" ).removeClass( "hidden" );
					}
				}
			},
			edit: {
				update_fgInputs: function() {
					var val = $( ".jp .word-input" ).val().split( "" );
					V.jp.vocab.edit.render_fgInputs( val );
				},
				render_fgInputs: function( val ) {
					var frag = document.createDocumentFragment();
					if ( val.constructor === Array ) {
						for ( var i=0; i<val.length; i++ ) {
							var el = document.createElement( "span" );
							el.setAttribute( "class", "fg-group" );
							el.innerHTML = "<input type='text' class='fg-input' id='fg-input" + i + "'></input><br>" + val[i];
							frag.appendChild( el );
						}
					} else {
						var el = document.createElement( "span" );
						el.setAttribute( "class", "fg-group" );
						el.innerHTML = "<input type='text' class='fg-input' id='fg-input0'></input><br>" + val;
						frag.appendChild( el );
					}
					$( ".jp .fg-inputs" ).html( frag );
				},
				expand_fgInputs: function() {
					V.jp.vocab.edit.update_fgInputs();
					V.display_none([ ".jp .word-input", ".jp .fg-inputs" ]);
					setTimeout( function() {
						$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
						V.display_none([ ".jp .btn.step2", ".jp .btn.step1" ])
					}, 10 );
				},
				special_reading: function() {
					var val = $( ".jp .word-input" ).val();
					V.display_none([ "#jp-normal-rdg", "#jp-special-rdg" ]);
					V.jp.vocab.edit.render_fgInputs( val );
					$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
				},
				normal_reading: function() {
					var val = $( ".jp .word-input" ).val().split( "" );
					V.display_none([ "#jp-special-rdg", "#jp-normal-rdg" ]);
					V.jp.vocab.edit.render_fgInputs( val );
					V.jp.vocab.edit.expand_fgInputs();
				},
				back_to_word: function() {
					$( ".jp .fg-input, .jp .fg-group" ).removeClass( "expanded" );
					setTimeout( function() {
						V.display_none([ ".jp .btn.step1", ".jp .btn.step2", "#jp-normal-rdg", ".jp .fg-inputs", ".jp .word-input" ]);
						$( ".jp .word-input" ).focus();
						var val = $( ".jp .word-input" ).val().split( "" );
						V.jp.vocab.edit.render_fgInputs( val );
					}, 500 );
				}
			}
		}
	},
	goto_page: function( to ) {
		var from = $( ".page" );
		for ( var i=0; i<from.length; i++ ) {
			if ( $( from[i] ).hasClass( "show" ) ) {
				$( from[i] ).removeClass( "show" ).addClass( "hidden" );
			}
		}
		setTimeout( function() {
			$( to ).removeClass( "hidden" ).addClass( "show" );
		}, 200 );
	},
	display_none: function( el ) {
		if ( el.constructor === Array ) {
			for ( var i=0; i<el.length; i++ ) {
				$( el[i] ).toggleClass( "display-none" );
			}
		} else {
			$( el ).toggleClass( "display-none" );
		}
	}
};

var V = View
	, M = Model;

// the end.