---
layout: post
title: "Current Favorites in Ruby: Structs, .nil?, and Retries"
date: 2014-11-10 21:02:00
categories: Programming Ruby
---
I've said it before, but I'll say it again: I love Ruby! Here are some of my favorite Ruby features these days.
## Struct
<code>Struct</code> is a quick way to create simple classes with a set of readable and writeable attributes. 
{% highlight ruby %}
Node = Struct.new(:key, :value, :next)
# ^ this is equivalent to:
class Node
  attr_accessor :key, :value, :next
end
{% endhighlight %}
Interacting with structures is exactly like interacting with the equivalent classes. They can be instantiated with any number of parameter arguments up to the number of attributes in <code>Struct.new</code>, with the nth parameter being assigned to the nth attribute. Any attributes not set during instantiation are nil.
{% highlight ruby %}
n = Node.new
# => #<struct Node key=nil, value=nil, next=nil>
n = Node.new(:language, "French")
# => #<struct Node key=:language, value="French", next=nil>
n = Node.new(:language, "French", Node.new, "oops!")
# ArgumentError: struct size differs
{% endhighlight %}

To make your structures do more than just store a set of attributes, you can pass them a block:
{% highlight ruby %}
Person = Struct.new(:first_name, :middle_name, :last_name) do
  def full_name
    "#{last_name}, #{first_name} #{middle_name}"
  end
end

jane = Person.new("Jane", "McSunshine", "Doe")
jane.full_name
# => "Doe, Jane McSunshine"
{% endhighlight %}

I've mostly used Structs for nested helper classes that support larger data structures, like entry structures in dictionaries or linked node structures in trees.

## .nil?
<code>.nil?</code> is easy to take for granted, but it is a great example of the amazing simplicity in the Ruby language. In many other languages, some things are objects while other things are primitives. In Ruby, **everything** is an object - numbers, strings, and even nil itself. This means that with Ruby, you can test values like this:
{% highlight ruby %}
orange_hat_people = query_by_hat_color("orange")
display(orange_hat_people) unless orange_hat_people.nil?
{% endhighlight %}
Instead of like this (in Javascript):
{% highlight javascript %}
var orangeHatPeople = queryByHatColor("orange");
if (orangeHatPeople !== null) {
  display(orangeHatPeople);
}
{% endhighlight %}

##### The Workings of this Magic
Ruby's <code>Object</code> class, which all other classes inherit from, defines .nil? to return false. <code>NilClass</code> is the one class that overrides .nil? to return true. 

## Retry
At work, I spend much of my time on a Rails application that communicates with various 3rd party services. Because mysteries happen, <code>retry</code> has become my friend. A <code>retry</code> inside of a <code>rescue</code> block causes re-execution of the contents in the <code>begin</code> block. 
{% highlight ruby %}
begin
  method_that_might_raise_error
rescue DerpException => e
  retry
end
{% endhighlight %}

This makes it easy in incorporate smart retry logic and failure alerts.
{% highlight ruby %}
attempts = 0
begin
  attempts += 1
  super_fun_stuff
rescue => e
  retry if attempts < 5
  alert_developer("exhausted retry attempts") if attempts >= 5
end
{% endhighlight %}
My inbox and my workplace's chat client thank <code>retry</code>. :)
## For more, see Ruby-Doc
Ruby is so pleasantly documented that I have read much of its documentation for fun. Luckily, there's still an unending number of subtle, powerful features that I have yet to learn about, so I won't get bored for a while. <a href="http://ruby-doc.org/" target="_blank">Check out the documentation here!</a>
