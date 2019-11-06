# HNNode - Hackernews via Node

Just a proof of concept which uses the fine streamed feed from hnstream.com and filters it for mentions of a keyword.

This project processes the live streaming of Hackernews comments from http://api.hnstream.com/comments/stream/, only keeps the comments which match the regex, adds sentiment, transforms the content to add links and other handy things, makes the comment slack friendly and finally post it on Slack.

# Deployment

## Slack

- Find or create a Slack workspace where you are the admin.
- Once in Slack, create a new channel that will receive your hackernews comments.
- Go to https://api.slack.com/apps?new_app=1 and create an app in this workspace.
- In this new app, click on "Incoming Webhooks" and activate them.
- Click on "Add New Webhook to Workspace" and attach this webhook to the new slack channel you just created.
- Collect and save the webhook URL, we will use it to setup the node.js application.
- It should look like this: https://hooks.slack.com/services/SOMESTUFF/FOOBAR/LettersAndNumbers.

## AWS

In this step, I will be using Debian but you can take the OS you prefer as long as you can install the latest version of Node.js and NPM with it.

Here is what I did for Debian 9.5:

- In your AWS account, deploy a lightsail instance,
- 2GB RAM, 1 vCPU, 60GB SSD, 3TB network, 10$/month.
- The important part is the 3TB network per month included...
- OS only, Debian 9.5

Connect to the instance and go root:

```
sudo su -
```

Change /etc/apt/sources.list to:

```plaintext
deb http://cdn-aws.deb.debian.org/debian testing main
deb http://security.debian.org/debian-security testing-security main
deb http://cdn-aws.deb.debian.org/debian testing-updates main
```

Then update the system but *keep* the existing version of the files that differ from the packages, they contains AWS configuration for SSH and NTP for example so you don't want to mess with those.

```
apt-get dist-upgrade -y && apt-get upgrade -y && apt-get autoclean && apt-get autoremove
apt-get install nodejs npm
node -v
# v10.17.0
npm -v
# 5.8.0
npm install pm2 -g
```

## Node.js

### Testing

As a normal user now, let's test the system works.

Export your slack URL (replace with yours):

```
export SLACK_HNMONITOR_WEBHOOK_URL="https://hooks.slack.com/services/SOMESTUFF/FOOBAR/LettersAndNumbers"
```

```
git clone https://github.com/codepope/hnnode.git
cd hnnode
npm install
```

Now let's test we can capture all the comments that contains "the " for example:

```
node index.js --regexp "the "
```

At this point, you should see a stream of comments in your slack channel as a LOT of comments contains the regex "the ". Kill it when you are done testing.

### Prod

We are using pm2 to start and monitor the node.

- Update the file `ecosystem.config.js` with your real production slack channel webhoock.

Then

```
pm2 start --env production ecosystem.config.js
```

That's, it. You are in production.

Here are a few useful commands:

```
pm2 start Hnnode
pm2 stop Hnnode
pm2 delete Hnnode
pm2 status
```

Because you are a good person, you also want to start this service when the instance reboots.

- read this: https://pm2.keymetrics.io/docs/usage/startup/

Then:

```
pm2 startup
```

It will tell you to type something like this:

```
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u admin --hp /home/admin
```

Now you need to save the current state of your pm2 configuration to restart this state on boot:

```
pm2 save
```

Job done.

