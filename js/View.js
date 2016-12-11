// Model/View JS

var Model = {
	// ---------- JAPANESE ----------
	jp: {
		vocab: {
			index: 1,
			ls: [], // localStorage cache
			words: [] // collated word list
		}
	}
};

var View = {
	// ---------- JAPANESE ----------
	jp: {
		// Vocab List
		vocab: {
			render_list: function() {
				$( ".jp.vocab .vocab-list" ).html( "" ); // clear the vocab list
				$( ".jp.vocab" ).removeClass( "loading" ); // remove loader
				var words = M.jp.vocab.words;
				for ( var i=0; i<words.length; i++ ) {
					var el = document.createElement( "div" ) // build word container
						, word = words[i].kj.split( "," ).join( "" )
						, reading = words[i].fg.split( "," ).join( "" )
						, type = words[i].t
						, def = words[i].d
						, html = word + " " + reading + " " +  "(" + type + ") " + def;
					html += " <a href='javascript:;' class='edit-btn' id='jp-edit-" + words[i].i + "'>edit</a>"; // edit word button
					html += " <a href='javascript:;' class='del-btn' id='jp-del-" + words[i].i + "'>delete</a>"; // delete word button
					html += "<br>";
					el.innerHTML = html;
					el.setAttribute( "class", "word" );
					el.setAttribute( "data-index", words[i].i );
					if ( words[i].f !== undefined ) {
						el.setAttribute( "data-src", "local" ); // flag if change from localStorage
					} else {
						el.setAttribute( "data-src", "json" ); // flag if cached from JSON
					}
					$( ".jp.vocab .vocab-list" ).append( el ); // append word container
					if ( i===words.length-1 ) {
						$( ".jp.vocab .vocab-list" ).removeClass( "hidden" ); // reveal vocab list
					}
				}
			},
			// Word Edit Form
			edit: {
				update_fgInputs: function() { // explode the contents of word-input and call render_fgInputs
					var val = $( ".jp .word-input" ).val().split( "" );
					V.jp.vocab.edit.render_fgInputs( val );
				},
				render_fgInputs: function( val ) { // create reading inputs for exploded word-input
					var frag = document.createDocumentFragment();
					if ( val.constructor === Array ) { // normal reading
						for ( var i=0; i<val.length; i++ ) {
							var el = document.createElement( "span" );
							el.setAttribute( "class", "fg-group" );
							el.innerHTML = "<input type='text' class='fg-input' id='fg-input" + i + "'></input><br>" + val[i];
							frag.appendChild( el );
						}
					} else { // special reading
						var el = document.createElement( "span" );
						el.setAttribute( "class", "fg-group" );
						el.innerHTML = "<input type='text' class='fg-input' id='fg-input0'></input><br>" + val;
						frag.appendChild( el );
					}
					$( ".jp .fg-inputs" ).html( frag );
				},
				expand_fgInputs: function() { // reveal and expand reading inputs
					V.jp.vocab.edit.update_fgInputs();
					setTimeout( function() { // slight delay for transition
						$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
						V.display_none([ ".jp .btn.step2", ".jp .btn.step1" ]); // hide step 1 btns, reveal step 2 btns
					}, 10 );
				},
				reading: function() { // go to default reading input view
					V.display_none([ ".jp .word-input", ".jp .fg-inputs" ]);  // hide word-input, reveal fg-inputs
					V.jp.vocab.edit.expand_fgInputs();
				},
				special_reading: function() { // render special reading view (single reading input for whole word)
					var val = $( ".jp .word-input" ).val();
					V.display_none([ "#jp-normal-rdg", "#jp-special-rdg" ]); // toggle normal/special rdg btns
					V.jp.vocab.edit.render_fgInputs( val );
					$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
				},
				normal_reading: function() { // return to normal reading view (individual reading inputs)
					var val = $( ".jp .word-input" ).val().split( "" );
					V.display_none([ "#jp-normal-rdg", "#jp-special-rdg" ]); // toggle normal/special rdg btns
					V.jp.vocab.edit.render_fgInputs( val );
					$( ".jp .fg-input, .jp .fg-group" ).addClass( "expanded" );
				},
				back_to_word: function() { // collapse reading inputs and return to word-input
					$( ".jp .fg-input, .jp .fg-group" ).removeClass( "expanded" );
					setTimeout( function() { // wait until inputs have expanded
						V.display_none([ ".jp .btn.step1", ".jp .fg-inputs", ".jp .word-input" ]); // reveal step 1 btns, hide fg-inputs
						$( ".jp .btn.step2, #jp-normal-rdg" ).addClass( "display-none" ); // hide step 2 btns (override)
						$( ".jp .word-input" ).focus();
						V.jp.vocab.edit.update_fgInputs(); // update fg-inputs behind the scenes
					}, 500 );
				},
				reset_form: function() { // clear all form input values and reset view
					$( ".jp .word-input" ).val( "" );
					V.jp.vocab.edit.back_to_word(); // return to step 1
					$( ".jp .word-type option:first-child" ).attr( "selected", "selected" );
					$( ".jp .word-def" ).val( "" );
					V.display_none( "#jp-normal-rdg" ); // hide normal reading btn
				}
			}
		}
	},
	// Global Utils
	goto_page: function( to ) { // basic page navigation
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
	show_overlay: function( options ) { // popup window controls
		$( ".overlay" ).removeClass( "hidden" );
		$( ".overlay .popup .prompt, .overlay .popup .btns" ).html( "" );
		var msgs = options.msgs;
		var btns = options.btns;
		var funcs = options.funcs;
		for ( var i=0; i<msgs.length; i++ ) { // render all message prompts
			var msg = document.createElement( "span" );
			msg.setAttribute( "class", "msg" );
			msg.innerHTML = msgs[i];
			$( ".overlay .popup .prompt" ).append( msg );
		}
		for ( var i=0; i<btns.length; i++ ) { // render all buttons
			var btn = document.createElement( "a" );
			btn.setAttribute( "class", "popup-btn" );
			btn.innerHTML = btns[i];
			$( ".overlay .popup .btns" ).append( btn );
			if ( typeof funcs[i] === "function" ) { 
				$( btn ).on( "click", funcs[i] ); // bind button events
			}
		}
	},
	hide_overlay: function() { // hides the popup window
		$( ".overlay" ).addClass( "hidden" );
	},
	display_none: function( el ) { // toggles .display-none class
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