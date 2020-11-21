---
layout: post
title: "Crash Course in Solving Software Bugs"
date: 2015-08-16 16:22:00
tags: programming
---
Much time on the job as a developer is spent not writing new code, but fixing bugs in old code. Bugs inevitably appear over time in an evolving codebase, and they need to be hunted down and cleaned up. Sometimes hunting them down is challenging. Here is a process for sniffing out the causes of enigmatic bugs in web applications. My examples involve Rails, but the concepts can be generalized to other web application environments.

### Research the Bug
- Take what you know already (if anything) and begin a **list of knowns**. Add any information available from the bug report. You might have a list of knowns like:
  - The issue happens on the 'Edit Account' page.
  - The issue only affects users who had a payment failure.
- See if the bug is easily *reproducible*. If it is, add information such as the following to your list of knowns:
  - **Which methods are involved in the symptom**. If the bug reveals itself from a web server action in Rails, you can determine some of the methods involved in the symptoms from the <code>rails server</code> output.
  - **What preconditions need to be met for the bug to appear**. Are there scenarios that *do not* reproduce the bug? Note any differences between those scenarios and the scenarios that *do* reproduce the bug.
- **Find commonalities** between records in the database known to have been involved with this bug. Do the affected records or their associated records share any unusual attribute values? Add any similarities you find to your growing list.
- **Do the affected records have any temporal overlap or patterns?** Their <code>created\_at</code> and <code>updated\_at</code> timestamps or those of their associated records could suggest that this is a new problem, perhaps introduced by a code change around that time, or that the issue only happens at a certain time of day or certain day of the month. Add any information you gather here to your list. You might note information like:
  - The issue has been happening since Aug. 5.
  - The issue seems to happen each day between 3 PM - 4 PM.
- Draw on any other available resources to gather similar information. Other resources could include log files, data sent to external services, etc.

At this point, you have a better understanding of the conditions that reproduce the bug. This is a major step. Next, you need to determine which part(s) of the code is related and how you need to change that code in order to fix the bug.

### Finding the Code Related to the Bug
- If you found any common values for attributes, search for parts of the codebase that set those attributes.
  - For example, if you found that affected user records share the value "unconfirmed" for their <code>status</code>, you can run searches for strings containing "unconfirmed" or "status =".
      - I normally use <code>grep</code> to search codebases. Grep is a unix command that lets you run searches from the command line like <code>grep -rn "status =" .</code> (The <code>r</code> option says to recursively search in subdirectories; the <code>n</code> option says to show the line number.) You can pipe that into a further search for "unconfirmed" if you suspect that the value is being set directly, e.g. <code>grep -rn "status =" . | grep "unconfirmed"</code>.
- If you found temporal commonalities along the lines of "The issue has been happening since \_\_\_", look at the commit history around that time. Look at both the commit messages and the code changes within the commits for any clues.
- If there were any temporal patterns like "The issue happens each day between 3 PM - 4 PM", see if there are any scheduled jobs that run around that time. If so, the job code could be related.

Study & trace through these possibly related parts of the code. If you are able to **reproduce the bug under a set of conditions, update the code with a fix, and then observe that the bug no longer happens under those same conditions**, then congratulations - you have most likely squashed the bug!

### And, if the Bug is Still Mysterious...
Some bugs, no matter how much you try to study and reproduce them locally, remain mystifying. With those, you might have reason to suspect that the bug is related to something that differs between your local environment and the environment where the bug was observed. There are 2 places to look to gather clues for these bugs:

- **Inside the app**. Search for any relevant differences between the config files in <code>config/environments/</code>, and look for <code>Rails.environment</code> conditionals throughout the codebase. Something you find here could explain why the bug manifests in one environment but not the other.
- **Outside the app**. Search for any infrastructure-related or external-service-related causes in remote logfiles, in data sent to external services, etc.

In the worst case scenario, the bug remains unreproducible, and the cause of the bug remains only a conjecture. However, if you have conducted research and eliminated a variety of other possible causes, and if you are putting in a hopeful-fix based on the information you've gathered, you should feel optimistic.
