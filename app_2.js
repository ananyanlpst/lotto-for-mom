var express = require('express')
var app = express()

app.use(express.json())

var axios = require('axios')
var qs = require('qs')
var data = qs.stringify({})

app.post('/check_lotto', (req, res) => {
    var { my_lotto } = req.body
    const { date } = req.body
    
    my_lotto = my_lotto.trim()

    const my_lotto_first_three = my_lotto.substr(0,3)
    const my_lotto_last_three = my_lotto.substr(3)
    const my_lotto_last_two = my_lotto.substr(4)

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

            if(!found) {
                res.json({
                    message: "คุณไม่ถูกรางวัล!"
                })
            } else {
                res.json(message_res)
            }
        })
        .catch( (error) => {
            res.json(error);
        });
})

app.listen(3002)