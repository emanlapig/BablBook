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
				$( "#jp-new-word" ).on( "click", C.jp.vocab.edit.init );
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
					}
				});
			},
			get_localStorage: function() { // fetch changes from localStorage
				var ls = window.localStorage.getItem( "BBBjpWords" );
				if ( ls !== null ) {
					var parseLs = JSON.parse( ls );
					M.jp.vocab.ls = parseLs; // cache localStorage
					for ( var i=0; i<parseLs.length; i++ ) {
						if ( parseLs[i].f === "new" ) { // new word
							M.jp.vocab.words.push( parseLs[i] ); // add to cached word list
						}
					}
				}
				M.jp.vocab.index = M.jp.vocab.words[ M.jp.vocab.words.length - 1 ].i; // increment word index
				V.jp.vocab.render_list();
			},
			// Word Edit Form
			edit: {
				new: true, // new word?
				init: function() { // initialize word edit form
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
					var ls = M.jp.vocab.ls
						, i = M.jp.vocab.index
						, kj = $( ".jp .word-input" ).val().split( "" ).toString()
						, t = $( ".jp .word-type" ).val()
						, d = $( ".jp .word-def" ).val()
						, cj = ""
						, g = ""
						, h = ""
						, l = 0;
					var fgInputs = $( ".fg-input" )
						, fgArray = [];
					for ( var ii=0; ii<fgInputs.length; ii++ ) {
						fgArray.push( $( fgInputs[ii] ).val() ); // collect reading inputs
					}
					var fg = fgArray.join( "," );
					// new word
					if ( C.jp.vocab.edit.new ) {
						// prep save data
						var word = {
							"i": i + 1,
							"kj": kj,
							"fg": fg,
							"t": t,
							"d": d,
							"cj": cj,
							"g": g,
							"l": l,
							"f": "new"
						}
						ls.push( word );
						var str = JSON.stringify( ls );
						window.localStorage.setItem( "BBBjpWords", str ); // save to localStorage
						M.jp.vocab.index = i + 1; // increment word index
						C.jp.vocab.edit.close(); // close the word edit form
					}
				},
				close: function() {
					$( ".word-edit .word-input" ).unbind();
					$( "#jp-reading" ).unbind();
					$( "#jp-special-rdg" ).unbind();
					$( "#jp-normal-rdg" ).unbind();
					$( "#jp-back-word" ).unbind();
					$( "#jp-save-word" ).unbind();
					// reset form and return to vocab list
					V.jp.vocab.edit.reset_form();
					C.jp.vocab.init();
					V.goto_page( ".jp.vocab" );
				},
				cancel: {
					confirm: function() {
						// populate popup window
						var options = {
							msgs: [ "Discard changes?" ],
							btns: [ "yes", "no" ],
							funcs: [ C.jp.vocab.edit.cancel.yes, C.jp.vocab.edit.cancel.no ] 
						}
						V.show_overlay( options );
					},
					yes: function() {
						C.jp.vocab.edit.close();
						V.hide_overlay();
					},
					no: function() {
						V.hide_overlay();
					}
				}
			}
		}
	}
};

var C = Controller;

// the end.