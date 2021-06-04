const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')
const app = express()
const axios = require('axios')
const qs = require('qs')
const e = require('express')

const port = process.env.PORT || 4000

// app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var data = qs.stringify({})

app.post('/webhook', (req,res) => {

    var reply_token = req.body.events[0].replyToken
    var my_lotto = req.body.events[0].message.text
    const date = '01062564'

    reply_message(reply_token, my_lotto, date)
    res.sendStatus(200)
})

app.listen(port)

function reply_message(reply_token, my_lotto, date) {

    let headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {1ogqp9VT3fsAyxOCrHSHWg+yZBeg8Dz7AK22cLELG4S0BOQIQ0l+IfG2KodHZD9VQuCroJvS+sHXxG0WNk9pvm2tgSkmlk84sEzvjzhaBHU0BxNqlaGe7AclezCEgnTpagwA/A1hbj32VzbVK/3JbAdB04t89/1O/w1cDnyilFU=}'
    }

    let body = JSON.stringify({
        replyToken: reply_token,
        messages: get_lotto(my_lotto, date)
    })

    request.post({
        url: 'https://api.line.me/v2/bot/message/reply',
        headers: headers,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode);
    });

    return false
}

function get_lotto(date, my_lotto){

    my_lotto = my_lotto.trim()

    const my_lotto_first_three = my_lotto.substr(0,3)
    const my_lotto_last_three = my_lotto.substr(3)
    const my_lotto_last_two = my_lotto.substr(4)

    var config = {
        method: 'post',
        url: 'https://api.krupreecha.com/' + date,
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': '8197159309be38788bdd41b53815a6c9', 
        },
        data: data
    }

      axios(config)
        .then( (response) => {

            const res_lotto = response.data
            const drawdate = res_lotto.drawdate
            const result = res_lotto.result

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
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_first_three + 
                                            ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                            return false;
                        }
                    } else if(id == 'lotto_last_three') {
                        if(number.includes(my_lotto_last_three)){
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_last_three + 
                                            ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                            return false;
                        }
                    } else if(id == 'my_lotto_last_two') {
                        if(number.includes(my_lotto_last_two)){
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_last_two + 
                                            ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                            return false;
                        }
                    } else {
                        if(typeof number == 'object'){
                            if(number.includes(my_lotto)){
                                message_res.push(
                                    {
                                        type: 'text',
                                        text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto + 
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                    }
                                )
                                found = true
                                return false;
                            }
                        } else if(typeof number == 'string'){
                            if(number == my_lotto){
                                message_res.push(
                                    {
                                        type: 'text',
                                        text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto + 
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                    }
                                )
                                found = true
                                return false;
                            }
                        }
                    }

                });

                if(found){
                    message_res.push(
                        {
                            type: 'text',
                            text: 'นุ่นเสียใจด้วย! แม่ไม่ถูกรางวัล :('
                        }
                    )
                }

                return [{
                    type: 'text',
                    text: 'นุ่นเสียใจด้วย! แม่ไม่ถูกรางวัล :('
                }]

            }
        })
        .catch( (error) => {
            res.json(error);
        });
}