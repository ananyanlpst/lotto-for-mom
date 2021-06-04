const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')
const app = express()
const axios = require('axios')
const qs = require('qs')

const port = process.env.PORT || 4000

// app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var data = qs.stringify({})

app.post('/webhook', (req,res) => {

    var reply_token = req.body.events[0].replyToken
    var { my_lotto } = req.body.events[0].message.text
    const date = '01062564'

    reply_message(reply_token, my_lotto, date)
    res.sendStatus(200)
})

app.listen(port)

function reply_message(reply_token, my_lotto, date) {
    
    my_lotto = my_lotto.trim()

    const my_lotto_first_three = my_lotto.substr(0,3)
    const my_lotto_last_three = my_lotto.substr(3)
    const my_lotto_last_two = my_lotto.substr(4)

    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {1ogqp9VT3fsAyxOCrHSHWg+yZBeg8Dz7AK22cLELG4S0BOQIQ0l+IfG2KodHZD9VQuCroJvS+sHXxG0WNk9pvm2tgSkmlk84sEzvjzhaBHU0BxNqlaGe7AclezCEgnTpagwA/A1hbj32VzbVK/3JbAdB04t89/1O/w1cDnyilFU=}'
    }

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: [
            {
                type: 'text',
                text: '3 ตัวหน้า : ' + my_lotto_first_three
            } ,
            {
                type: 'text',
                text: '3 ตัวหลัง : ' + my_lotto_last_three
            } ,
            {
                type: 'text',
                text: '2 ตัวหลัง : ' + my_lotto_last_two
            }
        ]
    })

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });

    return false;

    // res.json({
    //     my_lotto_first_three,
    //     my_lotto_last_three,
    //     my_lotto_last_two
    // })
    // return false

    var config = {
        method: 'post',
        url: 'https://api.krupreecha.com/' + date,
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': '8197159309be38788bdd41b53815a6c9', 
        },
        data: data
      };

      axios(config)
        .then( (response) => {

            const res_lotto = response.data
            const drawdate = res_lotto.drawdate
            const result = res_lotto.result

            // res.json(result)
            // return false

            var found = false
            var message_res = []

            if(res_lotto.code == '200'){
                result.forEach(value => {

                    const id = value['id']
                    const name = value['name']
                    const number = value['number']
                    const reword = value['reword']

                    for(var key in number) {
                        number[key] = number[key].trim();
                    }

                    if(id == 'lotto_first_three') {
                        if(number.includes(my_lotto_first_three)){
                            message_res.push({
                                message: "คุณถูกรางวัล"+ name +"!",
                                my_lotto,
                                reword
                            })
                            found = true
                            return false;
                        }
                    } else if(id == 'lotto_last_three') {
                        if(number.includes(my_lotto_last_three)){
                            message_res.push({
                                message: "คุณถูกรางวัล"+ name +"!",
                                my_lotto,
                                reword
                            })
                            found = true
                            return false;
                        }
                    } else {
                        if(typeof number == 'object'){
                            if(number.includes(my_lotto)){
                                message_res.push({
                                    message: "คุณถูกรางวัล"+ name +"!",
                                    my_lotto,
                                    reword
                                })
                                found = true
                                return false;
                            }
                        } else if(typeof number == 'string'){
                            if(number == my_lotto){
                                message_res.push({
                                    message: "คุณถูกรางวัล"+ name +"!",
                                    my_lotto,
                                    reword
                                })
                                found = true
                                return false;
                            }
                        }
                    }

                });
            }

            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {1ogqp9VT3fsAyxOCrHSHWg+yZBeg8Dz7AK22cLELG4S0BOQIQ0l+IfG2KodHZD9VQuCroJvS+sHXxG0WNk9pvm2tgSkmlk84sEzvjzhaBHU0BxNqlaGe7AclezCEgnTpagwA/A1hbj32VzbVK/3JbAdB04t89/1O/w1cDnyilFU=}'
            }

            if(!found) {
                message_res.push({
                    message: "เสียใจด้วย! คุณไม่ถูกรางวัล"
                })
            }
        
            let body = JSON.stringify({
                replyToken: reply_token,
                messages: [{
                    type: 'text',
                    text: 'Test lotto'
                }]
            })

            request.post({
                url: 'https://api.line.me/v2/bot/message/reply',
                headers: headers,
                body: body
            }, (err, res, body) => {
                console.log('status = ' + res.statusCode);
            });
        })
        .catch( (error) => {
            res.json(error);
        });
}