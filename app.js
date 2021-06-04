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
var data = qs.stringify({

})

app.post('/webhook', (req,res) => {

    var reply_token = req.body.events[0].replyToken
    var my_lotto = req.body.events[0].message.text
    const date = cal_date()

    reply_message(reply_token, my_lotto, date)
    res.sendStatus(200)
})

app.listen(port)

function reply_message(reply_token, my_lotto, date) {

    let config = {
        method: 'post',
        url: 'https://api.krupreecha.com/' + date['date_link'],
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': '8197159309be38788bdd41b53815a6c9', 
        },
        data: data
    }

    my_lotto = my_lotto.trim()

    const my_lotto_first_three = my_lotto.substr(0,3)
    const my_lotto_last_three = my_lotto.substr(3)
    const my_lotto_last_two = my_lotto.substr(4)

    var found = false
    var message_res = [
        {
            type: 'text',
            text: 'งวดวันที่ ' + date['date_text']
        }
    ]

    axios(config)
        .then( (response) => {

            const res_lotto = response.data
            const drawdate = res_lotto.drawdate
            const result = res_lotto.result

            if(res_lotto.code == '200'){
                result.forEach(value => {

                    const id = value['id']
                    const name = value['name']
                    const number = value['number']
                    const reword = Number(value['reword']).toLocaleString()

                    if(typeof number == 'object'){
                        for(var key in number) {
                            number[key] = number[key].trim();
                        }
                    }

                    if(id == 'lotto_first_three') {
                        if(number.includes(my_lotto_first_three)){
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูก' + name + ' : ' + my_lotto_first_three + ' 🎉' +
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                        }
                    } else if(id == 'lotto_last_three') {
                        if(number.includes(my_lotto_last_three)){
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูก' + name + ' : ' + my_lotto_last_three + ' 🎉' +
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                        }
                    } else if(id == 'lotto_last_two') {
                        if(number == my_lotto_last_two){
                            message_res.push(
                                {
                                    type: 'text',
                                    text:   'แม่ถูก' + name + ' : ' + my_lotto_last_two + ' 🎉' +
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                }
                            )
                            found = true
                        }
                    } else {
                        if(typeof number == 'object'){
                            if(number.includes(my_lotto)){
                                message_res.push(
                                    {
                                        type: 'text',
                                        text:   'แม่ถูก' + name + ' : ' + my_lotto + ' 🎉' +
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                    }
                                )
                                found = true
                            }
                        } else if(typeof number == 'string'){
                            if(number == my_lotto){
                                message_res.push(
                                    {
                                        type: 'text',
                                        text:   'แม่ถูก' + name + ' : ' + my_lotto + ' 🎉' +
                                                ' จำนวนเงิน ' + reword + ' บาท'
                                    }
                                )
                                found = true
                            }
                        }
                    }

                });

                if(!found && message_res.length == 0){
                    message_res.push(
                        {
                            type: 'text',
                            text: 'นุ่นเสียใจด้วย! แม่ไม่ถูกรางวัล 🥺'
                        }
                    )
                }

                let headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer {1ogqp9VT3fsAyxOCrHSHWg+yZBeg8Dz7AK22cLELG4S0BOQIQ0l+IfG2KodHZD9VQuCroJvS+sHXxG0WNk9pvm2tgSkmlk84sEzvjzhaBHU0BxNqlaGe7AclezCEgnTpagwA/A1hbj32VzbVK/3JbAdB04t89/1O/w1cDnyilFU=}'
                }
            
                let body = JSON.stringify({
                    replyToken: reply_token,
                    messages: message_res
                })
            
                request.post({
                    url: 'https://api.line.me/v2/bot/message/reply',
                    headers: headers,
                    body: body
                }, (err, res, body) => {
                    console.log('status = ' + res.statusCode);
                });
            }
            
        })
        .catch( (error) => {
            message_res.push(
                {
                    type: 'text',
                    text: error
                }
            )

            let headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer {1ogqp9VT3fsAyxOCrHSHWg+yZBeg8Dz7AK22cLELG4S0BOQIQ0l+IfG2KodHZD9VQuCroJvS+sHXxG0WNk9pvm2tgSkmlk84sEzvjzhaBHU0BxNqlaGe7AclezCEgnTpagwA/A1hbj32VzbVK/3JbAdB04t89/1O/w1cDnyilFU=}'
            }
        
            let body = JSON.stringify({
                replyToken: reply_token,
                messages: message_res
            })
        
            request.post({
                url: 'https://api.line.me/v2/bot/message/reply',
                headers: headers,
                body: body
            }, (err, res, body) => {
                console.log('status = ' + res.statusCode);
            });
        });

    return false
}

function cal_date(){

    let date = []

    let date_ob = new Date();

    let day = date_ob.getDate()
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2)
    let year = date_ob.getFullYear() + 543

    let hours = date_ob.getHours() + 7
    let minutes = date_ob.getMinutes()

    if(day == 16 && hours < 16 || day < 16){
        day = "01"
    } else {
        day = "16"
    }

    date['date_link'] = day + month + year
    date['date_text'] = day +" "+ month +" "+ year

    return date
}

// function get_lotto(date, my_lotto){

//     let config = {
//         method: 'post',
//         url: 'https://api.krupreecha.com/' + date,
//         headers: { 
//           'Content-Type': 'application/json', 
//           'x-api-key': '8197159309be38788bdd41b53815a6c9', 
//         },
//         data: data
//     }

//     my_lotto = my_lotto.trim()

//     const my_lotto_first_three = my_lotto.substr(0,3)
//     const my_lotto_last_three = my_lotto.substr(3)
//     const my_lotto_last_two = my_lotto.substr(4)

//     var found = false
//     var message_res = []

//     axios(config)
//         .then( (response) => {

//             const res_lotto = response.data
//             const drawdate = res_lotto.drawdate
//             const result = res_lotto.result

//             if(res_lotto.code == '200'){
//                 result.forEach(value => {

//                     const id = value['id']
//                     const name = value['name']
//                     const number = value['number']
//                     const reword = value['reword']

//                     for(var key in number) {
//                         number[key] = number[key].trim();
//                     }

//                     if(id == 'lotto_first_three') {
//                         if(number.includes(my_lotto_first_three)){
//                             message_res.push(
//                                 {
//                                     type: 'text',
//                                     text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_first_three + 
//                                             ' จำนวนเงิน ' + reword + ' บาท'
//                                 }
//                             )
//                             found = true
//                         }
//                     } else if(id == 'lotto_last_three') {
//                         if(number.includes(my_lotto_last_three)){
//                             message_res.push(
//                                 {
//                                     type: 'text',
//                                     text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_last_three + 
//                                             ' จำนวนเงิน ' + reword + ' บาท'
//                                 }
//                             )
//                             found = true
//                         }
//                     } else if(id == 'my_lotto_last_two') {
//                         if(number.includes(my_lotto_last_two)){
//                             message_res.push(
//                                 {
//                                     type: 'text',
//                                     text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto_last_two + 
//                                             ' จำนวนเงิน ' + reword + ' บาท'
//                                 }
//                             )
//                             found = true
//                         }
//                     } else {
//                         if(typeof number == 'object'){
//                             if(number.includes(my_lotto)){
//                                 message_res.push(
//                                     {
//                                         type: 'text',
//                                         text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto + 
//                                                 ' จำนวนเงิน ' + reword + ' บาท'
//                                     }
//                                 )
//                                 found = true
//                             }
//                         } else if(typeof number == 'string'){
//                             if(number == my_lotto){
//                                 message_res.push(
//                                     {
//                                         type: 'text',
//                                         text:   'แม่ถูกรางวัล ' + name + ' : ' + my_lotto + 
//                                                 ' จำนวนเงิน ' + reword + ' บาท'
//                                     }
//                                 )
//                                 found = true
//                             }
//                         }
//                     }

//                 });
//             }
            
//         })
//         .catch( (error) => {
//             message_res.push(
//                 {
//                     type: 'text',
//                     text: error
//                 }
//             )
//         });

//         console.log(message_res)

    
//     // if(!found && message_res.length == 0){
//     //     message_res.push(
//     //         {
//     //             type: 'text',
//     //             text: 'found : ' + found + ' , message_res : ' + message_res.length
//     //         }
//     //     )
//     // }

//     // return message_res
// }