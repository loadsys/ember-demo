<?php

class PagesController extends AppController {
	public $uses = array();

	public function home() {
		$this->autoRender = true;
	}
}
