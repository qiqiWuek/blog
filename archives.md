---
layout: page
title: "Archive"
permalink: /archive/
classes: page-archive
image: /images/home6.jpg 
---

# All Posts…..

{% assign groups = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% assign groups = groups | sort: "name" | reverse %}

{% for year in groups %}
<h2 class="tl-year">{{ year.name }}</h2>

<ol class="timeline">
  {% assign posts_in_year = year.items | sort: "date" | reverse %}
  {% for post in posts_in_year %}
  <li class="tl-item">
    <div class="tl-date">
      <span class="d">{{ post.date | date: "%d" }}</span>
      <span class="m">/ {{ post.date | date: "%b" }}</span>
    </div>
    <a class="tl-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
  </li>
  {% endfor %}
</ol>
{% endfor %}