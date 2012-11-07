<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8">
	<title>Ember Demo App - <?php echo $title_for_layout; ?></title>
	<?php echo $this->Html->meta('icon'); ?>
	<?php echo $this->Html->css('cake.generic'); ?>
	<?php echo $this->Html->script(array(
		'vendors/jquery-1.7.2.min',
		'vendors/handlebars-1.0.0.beta.6',
		'vendors/ember-1.0.0-pre.2',
		'vendors/ember-data',
		'vendors/date'
	)); ?>
</head>
<body>
	<script type="text/x-handlebars" data-template-name="application">
		<header {{bindAttr class="view.headerClassName"}}>
			<h1><a {{action goToHome href=true}}>Ember Demo Application</a></h1>
		</header>
		<div {{bindAttr class="view.contentClassName"}}>
			{{outlet menu}}
			{{outlet content}}
		</div>
		<footer {{bindAttr class="view.footerClassName"}}>
			<a href="http://www.cakephp.org" target="_blank">
				<img src="/img/cake.power.gif">
			</a>
		</footer>
	</script>

	<script type="text/x-handlebars" data-template-name="menu">
		<h3>Menu</h3>
		<ul>
			<li><a {{action goToHome href="true"}}>Posts</a></li>
			<li><a {{action addPost href="true"}}>Create Post</a></li>
		<ul>
	</script>

	<script type="text/x-handlebars" data-template-name="posts">
		<h2>All Posts View</h2>
		{{#each post in controller}}
			<h3><a {{action showPost post href=true}}>{{post.title}}</h3>
		{{/each}}
	</script>

	<script type="text/x-handlebars" data-template-name="post">
		<h2>{{title}}</h2>
		<div>
			{{#if publishedDate}}
				{{publishedDate}}
			{{else}}
				No published date
			{{/if}}
			<a {{action editPost controller.content href=true}}>Edit</a>
			<a {{action deletePost controller.content target="controller"}}>Delete</a>
		</div>
		<div>{{body}}</div>
	</script>

	<script type="text/x-handlebars" data-template-name="post-form">
		<form>
			<fieldset>
				<legend>{{#if isNew}}Create{{else}}Edit{{/if}} Post</legend>
				<div class="input text">
					<label>Title</label>
					{{view Ember.TextField valueBinding="title"}}
				</div>
				{{#unless isNew}}
					<div class="input text">
						<label>Published Date</label>
						{{view App.DateTextField contentBinding="controller"}}
					</div>
				{{/unless}}
				<div class="input textarea">
					<label>Body</label>
					{{view Ember.TextArea valueBinding="body"}}
				</div>
				<div class="submit">
					<input type="submit" value="Submit">
				</div>
			</fieldset>
		</form>
	</script>

	<?php echo $this->Html->script('application'); ?>
</body>
</html>
