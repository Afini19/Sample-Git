/*
 * CKFinder - Sample Plugins
 * ==========================
 * http://cksource.com/ckfinder
 * Copyright (C) 2007-2015, CKSource - Frederico Knabben. All rights reserved.
 *
 * This file and its contents are subject to the MIT License.
 * Please read the LICENSE.md file before using, installing, copying,
 * modifying or distribute this file or part of its contents.
 */

CKFinder.define( [ 'backbone', 'marionette', 'doT' ], function( Backbone, Marionette, doT ) {
	'use strict';

	/**
	 * Sample plugin which adds a button that opens a separate page with its own toolbar, inside CKFinder.
	 *
	 * This plugin illustrates how to:
	 *  - add a button to the "Main" toolbar,
	 *  - create own toolbar and add a button to it,
	 *  - create, show and close own page and render a view (custom HTML) inside,
	 */
	var CustomPage = {
		init: function( finder ) {
			var pageCreated = false;

			// Adds a button to the "Main" toolbar.
			finder.on( 'toolbar:reset:Main', function( evt ) {
				evt.data.toolbar.push( {
					label: 'Open Page',
					priority: 100,
					icon: 'ckf-view',
					action: openPage
				} );
			} );

			// Creates a page.
			// Some actions related to page creation can be done just once.
			function createPage() {
				// Request creating a toolbar when page is created.
				finder.once( 'page:create:MyPage', function() {
					finder.request( 'toolbar:create', { name: 'MyToolbar', page: 'MyPage' } );
				} );

				// Request resetting the toolbar when page is shown.
				finder.once( 'page:show:MyPage', function() {
					finder.request( 'toolbar:reset', { name: 'MyToolbar' } );
				} );

				// When MyToolbar is reset, add a button to it.
				finder.on( 'toolbar:reset:MyToolbar', function( evt ) {
					evt.data.toolbar.push( {
						type: 'button',
						label: 'Exit',
						icon: 'ckf-cancel',
						action: function() {
							finder.request( 'page:hide', { name: 'MyPage' } );
						}
					} );
				} );

				// Create a View class to be displayed in our page.
				var MyViewClass = Marionette.ItemView.extend( {
					template: doT.template( '<h2>{{=it.title}}</h2><button data-inline="true">Back to CKFinder</button></p>' ),
					// An example of handling events inside a page.
					events: {
						'click button': function() {
							finder.request( 'page:hide', { name: 'MyPage' } );
						}
					}
				} );

				// Create a View instance to be rendered in our page.
				var myView = new MyViewClass( {
					model: new Backbone.Model( { title: 'My own page' } )
				} );

				// Last but not least, create the page.
				finder.request( 'page:create', {
					view: myView,
					title: 'My page',
					name: 'MyPage',
					className: 'ckf-mypage'
				} );

				pageCreated = true;
			}

			function openPage() {
				if ( !pageCreated ) {
					createPage();
				}
				// In order to show a page, it must be created first.
				finder.request( 'page:show', { name: 'MyPage' } );
			}
		}
	};

	return CustomPage;
} );
