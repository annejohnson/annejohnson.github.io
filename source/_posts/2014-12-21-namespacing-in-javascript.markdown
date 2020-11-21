---
layout: post
title: "Namespacing in Javascript"
date: 2014-12-21 12:39:06
tags: programming javascript
---
Without namespacing, Javascript becomes disorganized and insane. Because effectively namespacing in Javascript involves anonymous functions and closures, some of Javascript's more confusing features, it's not always practiced. The result is a global namespace cluttered with every single variable and helper function ever used. This is bad.

### Namespacing Using Self-Executing Anonymous Functions and Closures

A self-executing anonymous function looks like this: <code>(function() { ... })();</code>. Each time you use one, you are also using a closure. Here is what this type of namespacing looks like:

{% highlight javascript %}
var onSaturn = (function() {
  return {
    jump: function() { console.log("Too heavy to jump."); },
    dropAnApple: function() { console.log("*Splat*."); }
  };
})();

onSaturn.jump();
// Too heavy to jump.
onSaturn.dropAnApple();
// *Splat*.
{% endhighlight %}


The only variable we've added to the global scope is <code>onSaturn</code>, and through it, we have access to <code>jump</code> and <code>dropAnApple</code>.

#### Leveraging the Power of the Closure

A closure is created with the self-executing anonymous function. It enables us to declare variables that the namespaced functions can access.

{% highlight javascript %}
var onSaturn = (function() {
  var gravityConstant = 10.44; // unit: m/s^2

  return {
    weight: function(mass) { return mass * gravityConstant; }
  };
})();
{% endhighlight %}

The closure enables selective exposure of its internal variables. In the above example, we are only exposing the <code>weight</code> function. The user is unable to access the internal variable <code>gravityConstant</code>.

{% highlight javascript %}
onSaturn.weight(40);
// 417.59999999999997
onSaturn.gravityConstant;
// undefined
{% endhighlight %}

Exposing it is as simple as adding it to the returned object:

{% highlight javascript %}
var onSaturn = (function() {
  var gravityConstant = 10.44; // unit: m/s^2

  return {
    weight: function(mass) { return mass * gravityConstant; },
    // Allow access to gravityConstant
    gravityConstant: gravityConstant
  };
})();
{% endhighlight %}

#### Dynamic Internal Variables

Say an asteroid strike happens, and part of Saturn is blown away. This will alter Saturn's gravitational constant. We need our <code>weight</code> function to always choose the correct value in its calculations.

Let's create an <code>asteroidStrike</code> function that reduces the gravitational constant.

{% highlight javascript %}
var onSaturn = (function() {
  var gravityConstant = 10.44,
      asteroidStrike; // Declare it

  // Define it to reduce gravityConstant
  asteroidStrike = function() {
    gravityConstant = gravityConstant * (3/4);
  };

  return {
    weight: function(mass) { return mass * gravityConstant; },
    gravityConstant: gravityConstant,
    // Expose it
    asteroidStrike: asteroidStrike
  };
})();
{% endhighlight %}

Like this, the weight function performs correctly even after an asteroid strike.

{% highlight javascript %}
onSaturn.weight(1);
// 10.44
onSaturn.asteroidStrike();
onSaturn.weight(1);
// 7.83
{% endhighlight %}

Unfortunately, the exposed <code>gravityConstant</code> does not behave as expected after the asteroid strike. It always returns 10.44.

{% highlight javascript %}
onSaturn.gravityConstant
// 10.44
onSaturn.asteroidStrike()
onSaturn.gravityConstant;
// 10.44
{% endhighlight %}

To resolve this, we should expose <code>gravityConstant</code> not as a number, but as a function that returns the value of the inner variable:

{% highlight javascript %}
var onSaturn = (function() {
  var gravityConstant = 10.44,
      asteroidStrike;

  asteroidStrike = function() {
    gravityConstant = gravityConstant * (3/4);
  };

  return {
    weight: function(mass) { return mass * gravityConstant; },
    // Expose gravityConstant as a function
    gravityConstant: function() { return gravityConstant; },
    asteroidStrike: asteroidStrike
  };
})();
{% endhighlight %}

Now, when we call the namespaced <code>gravityConstant()</code> function, we will always get the correct value.

{% highlight javascript %}
onSaturn.gravityConstant()
// 10.44
onSaturn.asteroidStrike()
onSaturn.gravityConstant()
// 7.83
{% endhighlight %}

#### Nested Namespaces

After creating the main namespace, making nested namespaces is easy. See an example below:

{% highlight javascript %}
onSaturn.north = (function() {
  var temperature = 30;

  return {
    temperature: function() { return temperature; }
  };
})();
{% endhighlight %}

Note that even though <code>onSaturn.north</code> is nested within the <code>onSaturn</code> object, it is created outside of the <code>onSaturn</code> closure. Therefore, <code>onSaturn.north</code> cannot access the private variables of <code>onSaturn</code>. Trying to access a private variable like <code>gravityConstant</code> will fail:

{% highlight javascript %}
onSaturn.north = (function() {
  return {
    gravityConstant: function() { return gravityConstant; }
  };
})();

onSaturn.north.gravityConstant();
// ReferenceError: gravityConstant is not defined
{% endhighlight %}

This wraps up my examples. I hope you're inspired to start namespacing your Javascript if you weren't already. Happy closures!
