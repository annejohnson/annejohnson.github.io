---
layout: post
title: "Refactoring: DNA Patterns"
date: 2016-05-24 18:46:08
categories: Programming Refactoring
---
In the absence of a side project, yet with an urge to do some programming, I dug up some old side projects. I suspected I would find opportunities for refactoring. Indeed, I did! This post is about the adventure of refactoring my [DNA Patterns](/dna-patterns) side project ([Github](https://github.com/annejohnson/dna-patterns)).

### About DNA Patterns

DNA Patterns is a single page Javascript app that displays visualizations of DNA sequences. Each visualization is a simple background of animated circles, with the diameter of each circle corresponding to an A, T, G, or C nucleotide in a DNA sequence. The user can switch between a few different species to see how the sequence varies from species to species.

### Old Implementation

The app was implemented as a single Javascript file, with everything happening in a single self-executing anonymous function. The Javascript had a few rigid dependencies:

- The presence of a <code>#birdVis</code> element on the page
- The <code>window.onload</code> handler for app initialization
- The [Raphael](https://github.com/DmitryBaranovskiy/raphael) library for rendering the circles

Unfortunately, these dependencies were mixed throughout the code and not configurable, making the code not very reusable.

### Refactoring for Reusability & Configurability

To make the code more reusable and configurable, I did the following:

- Split up pieces of functionality into small classes, each focused on one thing
- Made the app instantiable at will (e.g. a call to <code>(new App()).start()</code> instead of a <code>window.onload</code> handler)
- Parameterized the <code>birdVis</code> ID string (e.g. <code>new App('birdVis')</code>), instead of letting it live in the core Javascript
- Isolated the communication with the Raphael library into a wrapper class

As a result of those changes, I can now do the following easily:

- Initialize the app at a different point in time than <code>onload</code>
- Render the app in a different container element
- Replace the Raphael library (SVG-based) with a canvas-based library

### Refactoring Toward the Model/View/Controller Paradigm

I then composed the new classes within explicit view, model, and controller classes.

- The **model** represents a collection of species (each one having a DNA sequence), plus the index of the selected species.
- The **view** handles rendering the UI controls and the data visualizations.
- The **controller** is the middle-man between the view and the model.
  - When the view sees that the user has clicked to select a new species, it communicates _only_ with the controller. The controller then handles triggering updates on the model.

What happens after the model has changed? How does the view know to update the displayed visualization? I wanted a way for the view to know that the model has changed, but I didn't want the model to have to communicate directly with the view.

### Implementing Pub/Sub as a Way for the Model to Communicate Abstractly to the View

Enter the **publish-subscribe pattern** (pub/sub)!

Because the model is the authoritative source of exciting information, it behaves as a **publisher**, letting it subscribers know whenever an interesting change occurs. It behaves as a publisher by implementing a publisher interface (e.g. by defining methods like <code>publish</code> and <code>subscribe</code>). Whenever it changes in an interesting way, it calls the <code>publish</code> method to inform its subscribers of the change.

The **subscribers** are those who have subscribed themselves to the model using its <code>subscribe</code> method. When they receive the notification of the change, they can act however they wish. In this app, there is only one subscriber, the view. It acts by rendering the visualization for the newly selected species.

A major benefit of using this pattern is that I can now add new views easily. Say I wanted to add a widget in the foreground that contains a smaller visualization. With pub/sub, it's simply a matter of creating a new type of view and subscribing it to the model. Both views will receive a notification whenever the model updates. So exciting!
