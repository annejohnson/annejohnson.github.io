---
layout: post
title: "Deploying a Python Twitter Bot on AWS Lambda"
date: 2017-06-11 21:26:04
categories: Programming Python AWS
---

Once upon a time, I created a Twitter bot, [@poetryrobot](https://twitter.com/poetryrobot), to retweet poems every 30 minutes and send words of encouragement to people who tweet poetry. I [wrote the bot in Ruby](https://github.com/annejohnson/poetryrobot) and deployed it as a continually running process on an AWS t2.micro EC2 instance. It ran free of charge within the AWS free tier usage limits for 12 happy months.

After 12 months of free-tier usage, EC2 starts to cost money, but [AWS Lambda has a free tier that continues indefinitely](https://aws.amazon.com/lambda/pricing/). I wanted to keep @poetryrobot running in the cheapest way possible, so I decided to migrate it from EC2 to Lambda. Because AWS Lambda does not support Ruby, I needed to port the bot to one of the supported languages: Java, C#, Javascript, or Python. I went with Python. I had a fun and interesting time working with Python and AWS Lambda, so I thought I would write up the adventure. [The full code for the ported bot is here](https://github.com/annejohnson/poetryrobot_py).

This process assumes that Python v3 and a compatible version of pip are pre-installed.

# Step 1: Bootstrap the project

AWS Lambda allows you to write code directly into a web editor for simple scripts. However, if multiple files or external dependencies are needed, then development needs to occur in a directory whose files can then be zipped and uploaded to AWS Lambda.

I created a new code directory, `poetryrobot/`, containing a single Python file, `poetryrobot.py`.

Next, I picked out a Python Twitter package, [python-twitter](https://github.com/bear/python-twitter), and installed it into the code directory with the following:

{% highlight bash %}
# cd into the code directory, and then:
pip install python-twitter -t $(pwd)
{% endhighlight %}

The dependency needs to be installed in the code directory so that it can be included as part of the zip file.

# Step 2: Implement the bot

I created a `credentials.json` file which contained the following information:

{% highlight json %}
{
  "consumer_key": "...",
  "consumer_secret": "...",
  "access_token_key": "...",
  "access_token_secret": "..."
}
{% endhighlight %}

In the `poetryrobot.py` file, I imported the dependencies I would use and loaded the credentials:

{% highlight python %}
import twitter
import json
import random

with open('credentials.json') as f:
    credentials = json.loads(f.read())
{% endhighlight %}

Then, still in `poetryrobot.py`, I implemented the following method to be the AWS Lambda entry point (the "main" method), and I implemented the methods it calls (like `poem_tweets` and `retweet_someone`):

{% highlight python %}
def lambda_handler(_event_json, _context):
    tweets = poem_tweets()
    # Retweet a poet more often than reply to a poet:
    if random.random() <= 0.9:
        retweet_someone(tweets)
    else:
        reply_to_someone(tweets)
    follow_someone(tweets)
    follow_followers()
{% endhighlight %}

It's important that this main method accepts two arguments, because AWS Lambda will pass it two arguments.

The full `poetryrobot.py` file can be seen [here](https://github.com/annejohnson/poetryrobot_py/blob/master/poetryrobot.py).

# Step 3: Create the zip file

I highlighted everything in the code directory (not including the code directory itself) and compressed it into a zip file.

# Step 4: Create the Lambda function

I went to the AWS Lambda management console and clicked to create a new Lambda function. I selected the Blank Function template.

I clicked "Next" on the trigger screen to skip that step for now.

On the next screen, I set the runtime to Python 3.6 and named the function `poetryrobot`. I clicked to upload a zip file rather than type code inline, and I uploaded the generated zip file from Step 3. Then, I typed `poetryrobot.lambda_handler` (the name of the "main" method) into the handler field. I set a `lambda_basic_execution` role with CloudWatch log permissions. Finally, under "Advanced", I increased the timeout from the default to 20 seconds.

# Step 5: Testing the Lambda function

With just these steps, the Lambda function was ready to roll. I clicked the "Test" button and saw activity on Twitter along with logs send to CloudWatch.

# Step 6: Scheduling the Lambda function

This is the final step! I went to the CloudWatch management console, navigated to the events >> rules section, and clicked "Create rule". On the next screen, I set the event source to "Schedule" and set a fixed rate of 30 minutes. Then, I set the target to the `poetryrobot` Lambda function. Finally, I named the CloudWatch rule `poetryrobot_event` and clicked to create it. From there, the bot was up and running on its schedule!

# Thanks!

Thanks to [this article](http://blog.pythonicneteng.com/2016/09/make-twitter-bot-in-python-and-aws.html) and [the one it references](http://joelgrus.com/2015/12/30/polyglot-twitter-bot-part-3-python-27-aws-lambda/) for providing me with helpful Python and Lambda guidance.
