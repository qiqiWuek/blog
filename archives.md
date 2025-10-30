---
layout: page
title: "Archive"
permalink: /archive/
classes: page-archive
---

# 🌲All Posts.....

{% assign groups = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% assign groups = groups | sort: "name" | reverse %}

{% for year in groups %}
## {{ year.name }}
<ul>
  {% assign posts_in_year = year.items | sort: "date" | reverse %}
  {% for post in posts_in_year %}
    <li>
      <span style="color:#666">{{ post.date | date: "%b %d" }}</span>
      &nbsp;—&nbsp;
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
{% endfor %}