<template>
    <v-container style="padding: 0;">
        <v-row
            align="center"
            justify="center"
        >
            <v-col md="4" style="padding:0;">
                <v-card color="indigo darken-2" class="pa-12" style="height: 500px; position: relative;">
                    <v-navigation-drawer
                        floating
                        permanent
                    >
                        <v-list>
                            <v-list-item
                            v-for="item in items"
                            :key="item.title"
                            @click="chatUser(item.user)"
                            link
                            >
                            <v-list-item-icon>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>

                            <v-list-item-content v-bind:style="{color: item.status ? 'green' : 'red' }">
                                <v-list-item-title :class="{'newMessage': item.newMessage}">{{ item.title }} ({{item.status ? 'online' : 'offline'}})</v-list-item-title>
                            </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-navigation-drawer>
                </v-card>
            </v-col>
            <v-col md="8" style="padding:0;">
                <v-card class="pa-12" style="height: 500px;">
                    <div class="message-container" v-if="to !== ''">
                        <div class="messages">
                            <ul>
                                <li v-for="(message, index) in messages" v-bind:key="index"
                                :class="{'right': message.user == user, 'left': message.user != user}">
                                    {{message.message}}
                                </li>
                            </ul>
                        </div>
                        <div class="controls-container">
                            <span v-if="typing">{{to}} is typing...</span>
                            <v-text-field
                            label="Your Message..."
                            v-model="message"
                            @keydown="isTyping()"
                            ></v-text-field>
                            <v-btn color="primary" @click="sendMessage()">SEND</v-btn>
                        </div>
                    </div>
                    <p v-if="to === ''">Select a user to chat</p>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<style lang="scss" scoped>
.controls-container {
    position: absolute;
    bottom: 15px;
    width: 87%;
}
.newMessage {
    font-weight: bold;
}
.messages {
    ul {
        li {
            text-decoration: none;
            list-style-type: none;
            &.left {
                text-align: left;
            }
            &.right {
                text-align: right;
            }
        }
    }
}
</style>

<script>

import socketio from 'socket.io-client';
  export default {
    props: {
        user: {
            type: String,
            default: ''
        }
    },
    data () {
      return {
        typing: false,
        to: '',
        timeout: null,
        socket: socketio('localhost:3000', { upgrade: false, transports: ['websocket'] }),
        items: [
          { title: 'Raymund Y.', user: 'raymund', icon: 'account_box', status: false, newMessage: false },
          { title: 'RJ M.', user: 'rj', icon: 'account_box', status: false, newMessage: false },
          { title: 'Noe', user: 'noe', icon: 'account_box', status: false, newMessage: false },
          { title: 'Charm C', user: 'charm', icon: 'account_box', status: false, newMessage: false },
        ],
        message: '',
        messages: []
      }
    },
    mounted() {
        // emit to server that I'm online
        this.socket.emit('online', {user: this.user});

        // check for online users
        this.socket.on('is-online', (data) => {
            const user = this.items.filter(user => user.user === data.user);
            if (user.length) {
                user[0].status = true;
            }
        });

        // listen for messages
        this.socket.on('messages', (data) => {
            console.log(data);
            return;
            // filter messages, avoid duplicates
            if ( !this.messages.filter(m => m.user === data.user && m.message === data.message).length &&
                (this.user === data.toUser || this.user === data.user)) {
                this.messages.push(data);
            }
            
            // check if other users messaged this user
            //if (data.user != this.to) {
                console.log('has new message from => ' + data.user);
                const user = this.items.filter(user => user.user === data.user);
                if (user.length) {
                    user[0].newMessage = true;
                }
            //}
        });

        // listen for disconnected users
        this.socket.on('disconnected', (data) => {
            const user = this.items.filter(user => user.user === data.user);
            if (user.length) {
                user[0].status = false;
            }
        });
    },
    methods: {
        chatUser(toUser) {
            this.messages = [];
            this.typing = false;

            this.to = toUser;
            const user = this.items.filter(user => user.user === this.to);

            this.socket.on('message-receive', (data) => {
                if (this.user === data.toUser || this.user === data.user) {
                    this.messages.push(data);
                }
            });

            this.socket.on('typing-' + this.to, (data) => {
                if (this.to === data.user &&  this.user === data.toUser) {
                    this.typing = data.typing;
                }
            });

            // remove bold name
            if (user.length) {
                user[0].newMessage = false;
            }
        },

        sendMessage() {
            // send message
            this.socket.emit('message-sent', {user: this.user, toUser: this.to, message: this.message});

            // user stopped typing
            this.socket.emit('typing', {user: this.user, toUser: this.to, typing: false});

            // empty message input field
            this.message = '';
        },

        isTyping() {
            clearTimeout(this.timeout);

            // emit to server that current user is typing
            this.socket.emit('typing', {user: this.user, toUser: this.to, typing: true});

            this.timeout = setTimeout(() => {
                this.socket.emit('typing', {user: this.user, toUser: this.to, typing: false});
            }, 1000);
        }
    }
  }
</script>