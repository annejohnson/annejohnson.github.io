---
layout: post
title:  "Using Clojurescript to Make Charts with Raphael.js"
date:   2014-10-12 14:34:18
categories: Clojurescript Clojure
---
When I started using Clojurescript a few weeks ago, it was interesting learning how to translate between the two very different syntaxes of Javascript and Clojurescript. I'm going to share what I learned as I demonstrate how to use Clojurescript to make charts using <a href="http://g.raphaeljs.com/" target="_blank">Raphael.js's chart library</a>. Code is available <a href="http://github.com/annejohnson/cljs-raphael" target="_blank">here</a>.

## Setup with Leiningen

First, start a Clojure project using <a href="http://leiningen.org/" target="_blank">Leiningen</a> with the line `lein new cljs-raphael`. It's possible to use the Clojurescript compiler directly, but lein is the way to go if you want to develop other parts your project in Clojure.

Go into the cljs-raphael directory and open up project.clj. Add a Clojurescript dependency: `[org.clojure/clojurescript "0.0-2173"]`, and add the Clojurescript plugin: `:plugins [[lein-cljsbuild "1.0.2"]]`. Your project.clj should look like this:

{% highlight clojure %}
(defproject cljs-raphael "0.1.0-SNAPSHOT"
  :description "Clojurescript/Raphael funsies"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/clojurescript "0.0-2173"]]
  :plugins [[lein-cljsbuild "1.0.2"]])
{% endhighlight %}

Next, add your Clojurescript compiler options after the line `:plugins [[lein-cljsbuild "1.0.2"]]`.

{% highlight clojure %}
  :cljsbuild {
    :builds [{
        :source-paths ["src/cljs_raphael"]
        :compiler {
          :output-to "resources/js/app.js"
          :optimizations :whitespace
          :pretty-print true}}]}
{% endhighlight %}

With this configuration, the compiler will look in the `src/cljs_raphael` directory for Clojurescript files and compile them to `resources/js/app.js`.

At this point, run `lein deps` to get our Clojurescript dependency installed.

## External JS files and index.html

In order for us to write Clojurescript that uses Raphael, we need to include the Raphael SVG library and its corresponding graph library. Download <a href="http://github.com/DmitryBaranovskiy/raphael/raw/master/raphael-min.js" target="_blank">raphael-min.js</a>, <a href="http://github.com/DmitryBaranovskiy/g.raphael/raw/master/min/g.raphael-min.js" target="_blank">g.raphael-min.js</a>, and <a href="http://github.com/DmitryBaranovskiy/g.raphael/raw/master/min/g.pie-min.js" target="_blank">g.pie-min.js</a>, and place them inside of your `resources/js` directory.

We also need an `index.html` page onto which our Clojurescript can render graphs! Add the following into a new file, `resources/index.html`:

{% highlight html %}
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Clojurescript/Raphael Funsies!</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <div id="my-pie" style="height: 400px;"></div>
        <script src="js/raphael-min.js"></script>
        <script src="js/g.raphael-min.js"></script>
        <script src="js/g.pie-min.js"></script>
        <script src="js/app.js"></script>
    </body>
</html>
{% endhighlight %}

Let's put something on the page using Clojurescript. Make a new file, `src/cljs_raphael/pie.cljs`, and put this in it:

{% highlight clojure %}
(ns cljs-raphael.pie)

(defn init []
  (let [my-pie (.getElementById js/document "my-pie")]
    (set! (.-innerHTML my-pie) "Yeehaw!")))

(set! (.-onload js/window) init)
{% endhighlight %}

Next, run `lein cljsbuild auto`. This will compile your Clojurescript file into Javascript. If you leave it running, it will watch the `src/cljs_raphael` directory and recompile anytime a .cljs file is saved.

Open your `resources/index.html` in a browser. You should see "Yeehaw!" on the page.

## Making an Animated Pie Chart

Chart-making time! I will create a pie chart based on <a href="http://g.raphaeljs.com/piechart2.html" target="_blank">this demo chart</a>.

First, go to your `pie.cljs` file and update the `init` function to look like this:

{% highlight clojure %}
(defn init []
  (let [r (js/Raphael "my-pie")
        pie (.piechart 
             r 320 240 100 
             (array 55 20 13 32 5 1 2 10)
             (js-obj "legend" (array "with-55" "with-20" "so on...") 
                     "legendpos" "west"))]
        (other-functions-in-scope)))
{% endhighlight %}

This corresponds to the following Javascript:

{% highlight javascript %}
var r = Raphael("my-pie"),
        pie = r.piechart(320, 240, 100, [55, 20, 13, 32, 5, 1, 2, 10], 
                { legend: ["with-55", "with-20", "so on..."], 
                  legendpos: "west" 
                });
otherFunctionsInScope();
{% endhighlight %}

Note that in Clojurescript, we use `(let [r "some-value"] (code-to-execute-in-scope))` syntax to define Javascript scope variables. Also note the use of `(array)` and `(js-obj)` functions to create those particular JS data structures in Clojurescript.

Take another look at the dot and dot-dash characters in the Clojurescript above. Something like `(.log js/console "Yeehaw")`, with just a dot, correponds to calling an object's function. Meanwhile, something like `(.-onload js/window)` corresponds to getting or setting an object's property (here, the window object's onload property).


Now let's add a title. Replace `(other-functions-in-scope)` with this:

{% highlight clojure %}
(.attr 
 (.text r 320 100 "Clojurescript/Raphael Demo") 
 (js-obj "font" "20px sans-serif"))
{% endhighlight %}

This corresponds to:
{% highlight javascript %}
r.text(320, 100, "Clojurescript/Raphael Demo").attr({ font: "20px sans-serif" });
{% endhighlight %}

And refresh your page. You should see your pie chart, a legend, and the title! 

Next, let's add the fun hover effect. Start by adding this function above `init`:

{% highlight clojure %}
(defn sector-mousein
  []
  (this-as this
   (.stop (.-sector this))
   (.scale (.-sector this) 1.1 1.1 (.-cx this) (.-cy this))
   (if (.-label this)
     (do
       (.stop (nth (.-items (.-label this)) 0))
       (.attr (nth (.-items (.-label this)) 0) 
              (js-obj "r" 7.5))
       (.attr (nth (.-items (.-label this)) 1) 
              (js-obj "font-weight" 800))))))
{% endhighlight %}

This animates the wedges and corresponding labels when we hover over a pie chart wedge. In order to make this work, I used the `this-as` macro to open up access to `this`. Here is the corresponding Javascript:

{% highlight javascript %}
function () {
    this.sector.stop();
    this.sector.scale(1.1, 1.1, this.cx, this.cy);

    if (this.label) {
        this.label[0].stop();
        this.label[0].attr({ r: 7.5 });
        this.label[1].attr({ "font-weight": 800 });
    }
}
{% endhighlight %}

Next, add this function also above init. This is the function that will be called when the mouse leaves a wedge.

{% highlight clojure %}
(defn sector-mouseout
  []
  (this-as this
   (.animate 
    (.-sector this) 
    (js-obj "transform" (str "s1 1 " (.-cx this) " " (.-cy this))) 
    500 "bounce")
   (if (.-label this)
     (do 
       (.animate (nth (.-items (.-label this)) 0) (js-obj "r" 5) 500 "bounce")
       (.attr (nth (.-items (.-label this)) 1) (js-obj "font-weight" 400))))))
{% endhighlight %}

Lastly, add the following line inside `init` to bind those event handler functions to the pie chart wedges.

{% highlight clojure %}
(.hover pie sector-mousein sector-mouseout)
{% endhighlight %}

Refresh your page in the browser. At this point, you should have a <a href="http://annejohnson.github.io/cljs-raphael" target="_blank">sweet animated pie chart</a> - powered by the magical intersection of Clojurescript, the JVM, and interop with RaphaelJS. Get up and start dancing!

