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
				$( ".jp.vocab .vocab-list" ).html( "" );
				$( ".jp.vocab" ).removeClass( "loading" );
				var words = M.jp.vocab.words;
				for ( var i=0; i<words.length; i++ ) {
					var el = document.createElement( "div" )
						, word = words[i].kj.split( "," ).join( "" )
						, reading = words[i].fg.split( "," ).join( "" )
						, type = words[i].t
						, def = words[i].d
						, html = word + " " + reading + " " +  "(" + type + ") " + def;
					html += " <a href='javascript:;' class='edit-btn'>edit</a>";
					html += " <a href='javascript:;' class='del-btn'>delete</a>";
					html += "<br>";
					el.innerHTML = html;
					el.setAttribute( "class", "word" );
					el.setAttribute( "data-index", words[i].i );
					if ( words[i].f !== undefined ) {
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
				reading: function() {
					V.display_none([ ".jp .word-input", ".jp .fg-inputs" ]); 
					V.jp.vocab.edit.expand_fgInputs();
				},
				expand_fgInputs: function() {
					V.jp.vocab.edit.update_fgInputs();
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
					V.display_none([ "#jp-normal-rdg", "#jp-special-rdg" ]);
					V.jp.vocab.edit.render_fgInputs( val );
					$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
				},
				back_to_word: function() {
					$( ".jp .fg-input, .jp .fg-group" ).removeClass( "expanded" );
					setTimeout( function() {
						V.display_none([ ".jp .btn.step1", ".jp .fg-inputs", ".jp .word-input" ]);
						$( ".jp .btn.step2, #jp-normal-rdg" ).addClass( "display-none" );
						$( ".jp .word-input" ).focus();
						var val = $( ".jp .word-input" ).val().split( "" );
						V.jp.vocab.edit.render_fgInputs( val );
					}, 500 );
				},
				reset_form: function() {
					$( ".jp .word-input" ).val( "" );
					V.jp.vocab.edit.back_to_word();
					$( ".jp .word-type option:first-child" ).attr( "selected", "selected" );
					$( ".jp .word-def" ).val( "" );
					V.display_none( "#jp-normal-rdg" );
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
	show_overlay: function( options ) {
		$( ".overlay" ).removeClass( "hidden" );
		$( ".overlay .popup .prompt, .overlay .popup .btns" ).html( "" );
		var msgs = options.msgs;
		var btns = options.btns;
		var funcs = options.funcs;
		for ( var i=0; i<msgs.length; i++ ) {
			var msg = document.createElement( "span" );
			msg.setAttribute( "class", "msg" );
			msg.innerHTML = msgs[i];
			$( ".overlay .popup .prompt" ).append( msg );
		}
		for ( var i=0; i<btns.length; i++ ) {
			var btn = document.createElement( "a" );
			btn.setAttribute( "class", "popup-btn" );
			btn.innerHTML = btns[i];
			$( ".overlay .popup .btns" ).append( btn );
			if ( typeof funcs[i] === "function" ) {
				$( btn ).on( "click", funcs[i] );
			}
		}
	},
	hide_overlay: function() {
		$( ".overlay" ).addClass( "hidden" );
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