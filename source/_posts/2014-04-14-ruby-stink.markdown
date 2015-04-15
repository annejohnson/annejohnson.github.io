---
layout: post
title:  "Ruby Stink"
date:   2015-04-14 21:31:36
categories: Programming Ruby
---
This post is about unidiomatic Ruby code. First, a question:

### Why be idiomatic?

There are 2 aspects to code: its appearance and its function. It can be hideous in appearance and still be functional. However, functional but hideous code is of little use when the time comes to maintain or extend that code.

At best, ugly code causes future developers to facepalm. At worst, it wastes their time and frustrates them. Writing expressive, idiomatic code is therefore not just a common courtesy; it saves actual time and money in the long run.

## Examples
Here are a few unidiomatic Ruby snippets that are similar to code I've written or seen others write recently. 

I'll add to this post as I continue to find and improve awkward Ruby code!

#### Awkward hash manipulation
{% highlight ruby %}
# You have a hash of User ID -> Name key-value pairs.
# You want an array of the names.
users = { id1: "Anne", id2: "William" }
# Don't do this:
users.map{ |array| array[1] } # each array is [key, value]
# Do this:
users.values
# => ["Anne", "William"]
{% endhighlight %}

A call to <code>values</code> is clear. A mysterious map block with a 2-item array parameter is confusing.

#### Awkward introspection
{% highlight ruby %}
# You want to call a method only if an object has
# a method by that name.
animal.send :cluck # Fails for all except chickens
# Don't do this:
animal.send :cluck if animal.methods.include? :cluck
# Do this:
animal.send :cluck if animal.respond_to? :cluck
{% endhighlight %}

These work exactly the same, but <code>respond_to?</code> is more expressive.

#### Ambiguous naming
{% highlight ruby %}
# Don't do this:
def to_json(data)
  process data
end
# ^ What is data? The method turns what to json?

# Do this:
def string_to_json(data_string)
  process data_string
end
# ^ Convey type info through your method and parameter names
{% endhighlight %}

### Takeaways
- If a snippet of Ruby code "smells", even if only a tiny bit, then there's probably an overlooked opportunity for simplification.