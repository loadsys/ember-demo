(function() {
	var App;

	// Setup
	App = window.App = Ember.Application.create({
		ready: function() {
			console.log('Ember application is loaded and ready');
		}
	});

	App.store = DS.Store.create({
		revision: 7,
		adapter: DS.RESTAdapter.create({
			bulkCommit: false,
			namespace: 'api'
			// url: http://api.something.com
		})
	});

	// Mapping underscore keys in the api to the camel case version in the model
	DS.RESTAdapter.map('Post', {
		publishedDate: { key: 'published_date' }
	});

	DS.RESTAdapter.map('Comment', {
		emailHash: { key: 'email_hash' }
	});

	// Models
	App.Post = DS.Model.extend({
		title:         DS.attr('string'),
		body:          DS.attr('string'),
		publishedDate: DS.attr('string'),

		comments:      DS.hasMany('App.Comment')
	});

	App.Comment = DS.Model.extend({
		name:      DS.attr('string'),
		emailHash: DS.attr('string'),
		website:   DS.attr('string'),
		body:      DS.attr('string'),

		post:      DS.belongsTo('App.Post')
	});

	// Controllers
	App.ApplicationController = Ember.Controller.extend();

	App.MenuController = Ember.Controller.extend();

	App.PostsController = Ember.ArrayController.extend();

	App.PostController = Ember.ObjectController.extend({
		createPost: function() {
			App.store.commit();
			// Have to wait for the api response before redirecting
			this.get('content').addObserver('id', this, 'redirectToPosts');
		},

		updatePost: function() {
			App.store.commit();
			this.redirectToPosts();
		},

		deletePost: function() {
			this.get('content').deleteRecord();
			App.store.commit();
			this.redirectToPosts();
		},

		redirectToPosts: function() {
			App.router.transitionTo('index');
		}
	});

	// Views
	App.ApplicationView = Ember.View.extend({
		templateName:     'application',
		classNames:       ['container'],
		headerClassName:  'header',
		contentClassName: 'content',
		footerClassName:  'footer'
	});

	App.MenuView = Ember.View.extend({
		templateName: 'menu',
		classNames:   ['actions']
	});

	App.PostsView = Ember.View.extend({
		templateName: 'posts',
		tagName:      'section',
		classNames:   ['posts', 'index']
	});

	App.PostView = Ember.View.extend({
		templateName: 'post',
		tagName:      'article',
		classNames:   ['post', 'view']
	});

	App.PostFormView = Ember.View.extend({
		templateName: 'post-form',
		tagName:      'section',
		classNames:   ['post', 'form'],

		submit: function(event) {
			console.log('Form submitted');
			if (this.get('controller.isNew')) {
				this.get('controller').createPost();
			} else {
				this.get('controller').updatePost();
			}
			event.preventDefault();
		}
	});

	App.DateTextField = Ember.View.extend({
		tagName:    'input',
		classNames: ['datejs'],
		attributeBindings: ['type', 'value', 'size'],
		value: '',
		type: 'text',
		size: null,
		content: null,
		checkVal: function(event) {
			var value, el;
			if (event.keyCode === 13) return;
			el = this.$();
			value = Date.parse(el.val());
			if (value) {
				el.removeClass('invalid-date').addClass('valid-date');
				el.attr('title', value);
				this.set('content.publishedDate', value);
			} else {
				el.removeClass('valid-date').addClass('invalid-date');
				el.attr('title', 'Invalid Date');
				this.set('content.publishedDate', null);
			}
		},
		keyUp: function(event) {
			this.checkVal(event);
		},
		change: function(event) {
			this.checkVal(event);
		}
	});

	// Router
	App.Router = Ember.Router.extend({
		// log route state changes to console
		enableLogging: true,
		// root route has to exist, and all routes are contained inside
		root: Ember.Route.extend({

			index: Ember.Route.extend({
				route: '/',

				connectOutlets: function(router, context) {
					var posts = App.store.findAll(App.Post);
					router.get('applicationController').connectOutlet('content', 'posts', posts);
					router.get('applicationController').connectOutlet('menu', 'menu');
				}
			}),

			posts: Ember.Route.extend({
				route: '/posts',

				connectOutlets: function(router, context) {
					router.get('applicationController').connectOutlet('menu', 'menu');
				},

				view: Ember.Route.extend({
					route: '/:post_id',

					connectOutlets: function(router, context) {
						router.get('applicationController').connectOutlet('content', 'post', context);
					}
				}),

				add: Ember.Route.extend({
					route: '/add',

					connectOutlets: function(router, context) {
						router.get('applicationController').connectOutlet({
							outletName: 'content',
							viewClass:  App.PostFormView,
							controller: router.get('postController'),
							context:    App.store.createRecord(App.Post)
						});
					}
				}),

				edit: Ember.Route.extend({
					route: '/:post_id/edit',

					connectOutlets: function(router, context) {
						router.get('applicationController').connectOutlet({
							outletName: 'content',
							viewClass:  App.PostFormView,
							controller: router.get('postController'),
							context:    context
						});
					}
				})
			})
		}),

		// Actions that the {{action}} helper can call
		showPost: Ember.Router.transitionTo('posts.view'),
		addPost:  Ember.Router.transitionTo('posts.add'),
		editPost: Ember.Router.transitionTo('posts.edit'),

		goToHome: Ember.Router.transitionTo('root.index')
	});

	// Initialize the Ember application
	App.initialize();
}());