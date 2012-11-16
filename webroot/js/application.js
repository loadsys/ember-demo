(function() {
	var App;

	// Setup
	App = window.App = Ember.Application.create({
		ready: function() {
			console.log('Ember application is loaded and ready');
		}
	});

	// The latest RESTAdapter seems to have removed the date transform
	// so this just adds back the transform that is in the GitHub repo
	// @see /js/patches/date_transforms.js
	DS.RESTAdapter.registerTransform('date', window.DateTransform);

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
		publishedDate: DS.attr('date'),
		modified:      DS.attr('date'),
		created:       DS.attr('date'),

		comments:      DS.hasMany('App.Comment')
	});

	App.Comment = DS.Model.extend({
		name:      DS.attr('string'),
		emailHash: DS.attr('string'),
		website:   DS.attr('string'),
		body:      DS.attr('string'),
		modified:  DS.attr('date'),
		created:   DS.attr('date'),
		post_id:   DS.attr('number'),

		post:      DS.belongsTo('App.Post')
	});

	// Controllers are where business logic is contained. The simple usage
	// is one controller that is a subclass of Ember.ArrayController which
	// is the controller for the list of models. The other controller would
	// be a subclass of Ember.ObjectController and would be the controller
	// for an individual record.
	App.ApplicationController = Ember.Controller.extend();

	// Not all controllers must have logic. Sometimes just an empty controller
	// is necessary for convention.
	App.MenuController = Ember.Controller.extend();

	// This controller is where logic for the list of posts would go. Things
	// like sorting or filtering could go here.
	App.PostsController = Ember.ArrayController.extend();

	// This controller handles a single post model object. It contains the
	// business logic to create/update/delete the post. You might imagine the
	// other logic that could be involved in these methods.
	App.PostController = Ember.ObjectController.extend({
		createPost: function() {
			App.store.commit();
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

		publishedDateString: function(key, value) {
			var date;
			if (value) {
				date = value.split('-');
				this.set('publishedDate', new Date(date[0], date[1], date[2]));
				return value;
			}
			date = this.get('publishedDate');
			if (!date) return null;
			return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
		}.property('publishedDate'),

		redirectToPosts: function() {
			App.router.transitionTo('index');
		}
	});

	App.CommentsController = Ember.ArrayController.extend();

	App.CommentFormController = Ember.ObjectController.extend({
		createComment: function() {
			App.store.commit();
			this.set('content', App.store.createRecord(App.Comment));
		}
	});

	// Views define information about the templates that will be rendered, and
	// will handle events.
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

	App.CommentsView = Ember.View.extend({
		templateName: 'comments',
		tagName:      'section'
	});

	App.CommentFormView = Ember.View.extend({
		templateName: 'comment-form',

		submit: function(event) {
			this.get('controller').createComment();
			event.preventDefault();
		}
	});

	// By defining a view like this, it can be used in templates like so:
	// {{view App.DatePickerField valueBinding="publishedDate"}}
	App.DatePickerField = Ember.View.extend({
		tagName:           'input',
		classNames:        ['datepicker-input'],
		attributeBindings: ['type', 'value', 'readonly'],
		value:             '',
		type:              'text',
		readonly:          true,
		fieldName:         null,
		didInsertElement: function() {
			if (!this.get('fieldName')) return;
			this.$().datepicker({
				dateFormat: 'yy-mm-dd'
			});
		},
		change: function() {
			this.get('parentView.controller').set(this.get('fieldName'), this.$().val());
		}
	});

	// Router
	App.Router = Ember.Router.extend({
		// log route state changes to console
		// enableLogging: true,
		// root route has to exist, and all routes are contained inside
		root: Ember.Route.extend({
			// All Routes can have an enter method that will be called when the
			// route is entered. Since the root route will only be entered once
			// this is a good place to initialize the list of posts.
			enter: function() {
				// Create a list of all posts for the app to use
				App.posts = App.store.findAll(App.Post);
				App.comments = App.store.findAll(App.Comment);
			},
			// Index route that is run at the the root of the application.
			index: Ember.Route.extend({
				route: '/',
				// The connectOutlets method will be called and is the opprotunity
				// to assign controller/views to outlets.
				connectOutlets: function(router, context) {
					router.get('applicationController').connectOutlet('content', 'posts', App.posts);
					router.get('applicationController').connectOutlet('menu', 'menu');
				}
			}),

			posts: Ember.Route.extend({
				route: '/posts',
				// Because each route in the chain, starting at root will be entered
				// and exited on the way to the edge or leaf route, all the connectOutlets
				// methods will get called. This one is being used to add the menu.
				// This same setup could assign a different menu for other resourses.
				connectOutlets: function(router, context) {
					router.get('applicationController').connectOutlet('menu', 'menu');
				},

				view: Ember.Route.extend({
					// By using the default Ember-data store and RESTAdapter,
					// following the the convention of lowercase model + '_id'
					// will make the context be the record for the id in the url
					route: '/:post_id',

					connectOutlets: function(router, context) {
						router.get('applicationController').connectOutlet('content', 'post', context);
						router.get('postController').connectOutlet('comments', App.comments.filter(function() {
							return item.get('post_id') === context.get('id');
						}));
						router.get('commentsController').connectOutlet('commentForm', App.store.createRecord(App.Comment));
						router.get('commentFormController').set('post_id', context.get('id'));
					},

					// When exiting this state, rollback the default transaction
					// so that any new comments that are not saved are not saved
					// later
					exit: function() {
						App.store.rollback();
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

		// Actions that the {{action}} helper can call. Depending on where these
		// actions are defined restricts what states have access to others. For
		// instance, if the editPost action were to be defined in the posts route,
		// then the edit state would not be accessible from the root.index route
		viewPost: Ember.Router.transitionTo('posts.view'),
		addPost:  Ember.Router.transitionTo('posts.add'),
		editPost: Ember.Router.transitionTo('posts.edit'),

		goToHome: Ember.Router.transitionTo('root.index')
	});

	// Initialize the Ember application. By calling this method, Ember will
	// start to create instances of all the controllers that are assigned to
	// your namespace (App). Minimally, this expects an ApplicationController
	// and ApplicationView.
	App.initialize();
}());
