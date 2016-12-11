// Controller JS

var Controller = {
	// ---------- MAIN ----------
	init: function() {
		$( "#jp-main" ).on( "click", C.jp.init );
	},
	// ---------- JAPANESE ----------
	jp: {
		// Main
		init: function() { // initialize main view
			$( "#jp-main" ).unbind();
			$( "#jp-vocab" ).on( "click", C.jp.vocab.init );
			V.goto_page( ".jp.main" );
		},
		// Vocab List
		vocab: {
			init: function() { // initialize vocab list view
				$( "#jp-vocab" ).unbind();
				$( "#jp-new-word" ).on( "click", C.jp.vocab.edit.new );
				V.goto_page( ".jp.vocab" );
				C.jp.vocab.get_JSON();
			},
			get_JSON: function() { // fetch words from JSON
				$.ajax({
					url: "js/json/jp_words.json",
					success: function( data ) {
						var words = JSON.parse( data );
						M.jp.vocab.words = words.jpWords; // cache fetched words
						M.jp.vocab.index = words.index; // cache word index
						C.jp.vocab.get_localStorage();
					},
					error: function( jqXHR, textStatus, errorThrown ) {
						console.log( errorThrown );
						M.jp.vocab.words = []; // cache fetched words
						M.jp.vocab.index = 0; // cache word index
						C.jp.vocab.get_localStorage();
					}
				});
			},
			get_localStorage: function() { // fetch changes from localStorage
				var ls = window.localStorage.getItem( "BBBjpWords" );
				if ( ls !== null && ls !== "[]" ) {
					var parseLs = JSON.parse( ls );
					var words = M.jp.vocab.words;
					M.jp.vocab.ls = parseLs; // cache localStorage
					M.jp.vocab.index = words[ words.length - 1 ].i; // get word index
					for ( var i=0; i<parseLs.length; i++ ) {
						if ( parseLs[i].i > M.jp.vocab.index ) {
							M.jp.vocab.index = parseLs[i].i; // user might have deleted the most recent word index
						}
						if ( parseLs[i].f === "new" ) { // new word
							words.push( parseLs[i] ); // add to cached word list
						}
						if ( parseLs[i].f === "delete" ) { // delete word
							for ( var j=0; j<words.length; j++ ) {
								if ( words[j].i == parseLs[i].i ) {
									words.splice( j, 1 );
								}
							}
						}
					}
				}
				V.jp.vocab.render_list();
				setInterval( C.jp.vocab.bind_list_btns, 500 ); // let the list load before binding btn events
			},
			bind_list_btns: function() { // bind vocab list button events
				var editBtns = $( ".edit-btn" );
				var delBtns = $( ".del-btn" );
				for ( var i=0; i<editBtns.length; i++ ) {
					$( editBtns[i] ).on( "click", function() {
						var index = $( this ).parent().attr( "data-index" );
						var src = $( this ).parent().attr( "data-src" );
						C.jp.vocab.edit.action = "edit";
						C.jp.vocab.edit.src = src;
						C.jp.vocab.edit.index = index;
						C.jp.vocab.edit.init();
					});
				}
				for ( var i=0; i<delBtns.length; i++ ) {
					$( delBtns[i] ).on( "click", function() {
						var index = $( this ).parent().attr( "data-index" );
						var src = $( this ).parent().attr( "data-src" )
						C.jp.vocab.edit.action = "delete";
						C.jp.vocab.edit.src = src;
						C.jp.vocab.edit.index = index;
						C.jp.vocab.edit.delete.confirm();
					});
				}
			},
			// Word Edit Form
			edit: {
				action: "new", // new || edit || delete
				src: "local", // local || json
				index: 1, // word index
				open: false,
				init: function() { // initialize word edit form
					C.jp.vocab.edit.open = true;
					$( "#jp-new-word" ).unbind();
					V.goto_page( ".jp.word-edit" );
					$( ".word-edit .word-input" ).on( "keyup", V.jp.vocab.edit.update_fgInputs );
					$( "#jp-reading" ).on( "click", V.jp.vocab.edit.reading );
					$( "#jp-special-rdg" ).on( "click", V.jp.vocab.edit.special_reading );
					$( "#jp-normal-rdg" ).on( "click", V.jp.vocab.edit.normal_reading );
					$( "#jp-back-word" ).on( "click", V.jp.vocab.edit.back_to_word );
					$( "#jp-cancel-word" ).on( "click", C.jp.vocab.edit.cancel.confirm );
					$( "#jp-save-word" ).on( "click", C.jp.vocab.edit.validate );
				},
				new: function() {
					C.jp.vocab.edit.action = "new";
					C.jp.vocab.edit.src = "local";
					C.jp.vocab.edit.index = M.jp.vocab.index + 1; // get most recent word index and increment
					C.jp.vocab.edit.init();
				},
				validate: function() { // validate word data to save
					var word = $( ".jp .word-input" ).val()
						, def = $( ".jp .word-def" ).val()
						, haveWord = ( word !== "" ) // user entered a word?
						, haveDef = ( def !== "" ); // user entered a definition?
					if ( !haveWord ) {
						alert( "you have not entered a word" );
					}
					if ( !haveDef ) {
						alert( "you have not entered a definition" );
					}
					if ( haveWord && haveDef ) {
						C.jp.vocab.edit.save(); // if we have all required data then save
					}
				},
				save: function() { // collect and save word data to local storage
					var action = C.jp.vocab.edit.action
						, src = C.jp.vocab.edit.src
						, ls = M.jp.vocab.ls;
					var i = C.jp.vocab.edit.index
						, kj = $( ".jp .word-input" ).val().split( "" ).toString()
						, t = $( ".jp .word-type" ).val()
						, d = $( ".jp .word-def" ).val()
						, cj = ""
						, g = ""
						, h = ""
						, l = 0;
					var fgInputs = $( ".fg-input" )
						, fgArray = [];
					for ( var j=0; j<fgInputs.length; j++ ) {
						fgArray.push( $( fgInputs[j] ).val() ); // collect reading inputs
					}
					var fg = fgArray.join( "," );
					// prep save data
					var word = {
						"i": i,
						"kj": kj,
						"fg": fg,
						"t": t,
						"d": d,
						"cj": cj,
						"g": g,
						"l": l
					}
					// save word
					if ( action === "new" ) {
						word.f = "new"; // flag change
						ls.push( word );
						M.jp.vocab.words.push( word );
						M.jp.vocab.index = i; // save new word index
					} else if ( action === "edit" ) {
						if ( src === "local" ) { // changes to a word in ls, ie a change to a change
							for ( var j=0; j<ls.length; j++ ) {
								if ( ls.i === i ) {
									word.f = ls[j].f; // retain existing flag
									ls[j] = word; // save to cache
									break;
								}
							}
						} else { // changes to a cached word from JSON
							word.f = "edit"; // flag change
							ls.push( word );
						}
					}
					setTimeout( C.jp.vocab.edit.close, 100 ); // give changes some time to save before closing
					C.jp.vocab.edit.save_ls();
				},
				close: function() {
					$( ".word-edit .word-input, #jp-reading, #jp-special-rdg, #jp-normal-rdg, #jp-back-word, #jp-cancel-word, #jp-save-word" ).unbind();
					// reset form and return to vocab list
					V.jp.vocab.edit.reset_form();
					C.jp.vocab.init();
					C.jp.vocab.edit.open = false;
				},
				cancel: {
					confirm: function() {
						// populate popup window
						var options = {
							msgs: [ "Discard changes?" ],
							btns: [ "yes", "no" ],
							funcs: [ C.jp.vocab.edit.cancel.yes, C.jp.vocab.edit.cancel.no ] 
						}
						V.show_overlay( options ); // reveal popup
					},
					yes: function() {
						C.jp.vocab.edit.close();
						V.hide_overlay();
					},
					no: function() {
						V.hide_overlay();
					}
				},
				delete: {
					confirm: function() {
						// populate popup window
						var options = {
							msgs: [ "Delete word?" ],
							btns: [ "yes", "no" ],
							funcs: [ C.jp.vocab.edit.delete.yes, C.jp.vocab.edit.delete.no ] 
						}
						V.show_overlay( options ); // reveal popup
					},
					yes: function() {
						var ls = M.jp.vocab.ls;
						if ( C.jp.vocab.edit.src === "local" ) { // delete local
							for ( var i=0; i<ls.length; i++ ) {
								if ( ls[i].i == C.jp.vocab.edit.index ) {
									ls.splice( i, 1 );
									break;
								}
							}
						} else { // delete cached from JSON
							word = {
								i: C.jp.vocab.edit.index,
								f: "delete"
							}
							ls.push( word );
						}
						C.jp.vocab.edit.save_ls();
						V.hide_overlay();
						if ( C.jp.vocab.edit.open ){
							C.jp.vocab.edit.close(); // close the word edit form and refresh the vocab list
						} else {
							C.jp.vocab.get_JSON(); // refresh the vocab list
						}
					},
					no: function() {
						V.hide_overlay();
					}
				},
				save_ls: function() {
					var ls = M.jp.vocab.ls
						, str = JSON.stringify( ls );
					window.localStorage.setItem( "BBBjpWords", str ); // save to localStorage
				}
			}
		}
	}
};

var C = Controller;

// the end.