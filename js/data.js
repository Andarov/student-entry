const AppSettings = {
    // 1. Viloyatlar ro'yxati, parollari, scriptURL o'zining tumanlari va operatorlari bilan
    viloyatlar: [
        {
            name: "Xorazm viloyati",
            password: "123", 
            scriptUrl: "https://script.google.com/macros/s/AKfycbyhgrwvQu_N0zKNJYM1lXP9Axp0fUrT4OiAuNlv8UhRsPgyRA7pyBC5rCDLbiU9h5oNtg/exec",
            tumans: [
                "Urganch shahri", "Urganch tumani", "Bog'ot", "Gurlan", "Qo'shko'pir", "Shovot", "Xonqa", "Xiva shahri", "Xiva tumani", "Yangiariq", "Yangibozor", "Hazorasp", "Tuproqqal'a"
            ],
            operators: [
                "Xorazm Operator 1", "Xorazm Operator 2", "Xorazm Bosh Operator"
            ]
        },
        {
            name: "Buxoro viloyati",
            password: "345",
            scriptUrl: "https://script.google.com/macros/s/AKfycbxxb2DMjMY90cCzP0zQvhU52Y7i-xbeJZBbsA-4QS7t69SUuIymy0_pcMcQwcMjM5aV/exec",
            tumans: [
                "Buxoro shahri", "Buxoro tumani", "Vobkent", "G'ijduvon", "Jondor", "Kogon shahri", "Kogon tumani", "Olot", "Peshku", "Romitan", "Qorovulbozor", "Qorako'l", "Shofirkon"
            ],
            operators: [
                "Buxoro Operator 1", "Buxoro Operator 2", "Buxoro Bosh Operator"
            ]
        },
        {
            name: "Navoiy viloyati",
            password: "123",
            scriptUrl: "https://script.google.com/macros/s/AKfycby.../exec",
            tumans: [
                "Navoiy shahri", "Zarafshon shahri", "Karmana", "Qiziltepa", "Navbahor", "Nurota", "Konimex", "Tomdi", "Uchquduq", "Xatirchi"
            ],
            operators: [
                "Navoiy Operator 1", "Navoiy Operator 2", "Navoiy Bosh Operator"
            ]
        },
        {
            name: "Samarqand viloyati",
            password: "123",
            scriptUrl: "https://script.google.com/macros/s/AKfycby.../exec",
            tumans: [
                "Samarqand shahri", "Kattaqo'rg'on shahri", "Bulung'ur", "Ishtixon", "Jomboy", "Kattaqo'rg'on tumani", "Qo'shrabot", "Narpay", "Nurobod", "Oqdaryo", "Paxtachi", "Payariq", "Pastdarg'om", "Samarqand tumani", "Toyloq", "Urgut"
            ],
            operators: [
                "Samarqand Operator 1", "Samarqand Operator 2", "Samarqand Bosh Operator"
            ]
        },
        {
            name: "Sirdaryo viloyati",
            password: "123",
            scriptUrl: "https://script.google.com/macros/s/AKfycby.../exec",
            tumans: [
                "Guliston shahri", "Yangiyer shahri", "Shirin shahri", "Oqoltin", "Boyovut", "Guliston tumani", "Xovos", "Mirzaobod", "Sardoba", "Sirdaryo tumani", "Sayxunobod"
            ],
            operators: [
                "Sirdaryo Operator 1", "Sirdaryo Operator 2", "Sirdaryo Bosh Operator"
            ]
        }
    ],

    // 2. Maktablar ro'yxati (Barcha viloyatlarda ishlatiladigan umumiy maktablar ro'yxati ro'yxati ro'yxati)
    schools: [
        "1-maktab", "2-maktab", "3-maktab", "4-maktab", "5-maktab","6-maktab", "7-maktab", "8-maktab", "9-maktab", "10-maktab","11-maktab", "12-maktab", "13-maktab", "14-maktab", "15-maktab","16-maktab", "17-maktab", "18-maktab", "19-maktab", "20-maktab","21-maktab", "22-maktab", "23-maktab", "24-maktab", "25-maktab","26-maktab", "27-maktab", "28-maktab", "29-maktab", "30-maktab","31-maktab", "32-maktab", "33-maktab", "34-maktab", "35-maktab","36-maktab", "37-maktab", "38-maktab", "39-maktab", "40-maktab","41-maktab", "42-maktab", "43-maktab", "44-maktab", "45-maktab","46-maktab", "47-maktab", "48-maktab", "49-maktab", "50-maktab","51-maktab", "52-maktab", "53-maktab", "54-maktab", "55-maktab","56-maktab", "57-maktab", "58-maktab", "59-maktab", "60-maktab",
        "Prezident maktabi", "Ixtisoslashtirilgan maktab", "Xususiy maktab"
    ],

    // 3. Yo'nalishlar (So'ralganidek faqat 3 ta qilib qo'yildi)
    directions: [
        "Tibbiyot", "Pedagogika", "Psixalogiya"
    ],

    // 4. Ta'lim shakli
    forms: [
        "Kunduzgi", "Kechki"
    ]
};
