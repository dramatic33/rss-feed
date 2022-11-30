<?php

class KakaoBankBridge extends BridgeAbstract
{
    const NAME = 'KakaoBankBridge';
    const CACHE_TIMEOUT = 60;
    public function collectData()
    {
        // We can perform css selectors on $dom
        $dom = getSimpleHTMLDOM('https://search.naver.com/search.naver?where=news&query=%EC%B9%B4%EC%B9%B4%EC%98%A4%EB%B1%85%ED%81%AC&sm=tab_opt&sort=1&photo=0&field=0&pd=0&ds=&de=&docid=&related=0&mynews=0&office_type=0&office_section_code=0&news_office_checked=&nso=so%3Add%2Cp%3Aall&is_sug_officeid=0');

        // An array of dom nodes
        $blogPosts = $dom->find('.list_news li');

        foreach ($blogPosts as $blogPost) {
            // Select the anchor at index 0 (the first anchor found)
            $a = $blogPost->find('a.news_tit', 0);

            // Select the inner text of the anchor
            $title = $a->text();

            // Select the href attribute of the anchor
            $url = $a->href;
	    $content = $blogPost->find('.news_dsc .dsc_wrap a', 0);
	    $author = $blogPost->find('.info.press', 0)->text();
            $item = [
                'title' => $title,
                'uri' => $url,
                'author' => $author,
		'content' => $content->text(),
		'id' => $url,
		'uid' => $url,
            ];

            // Add the item to the list of items
            $this->items[] = $item;
        }
    }
}
