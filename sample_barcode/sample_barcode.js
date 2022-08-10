function getIds() {
    return sample.ids;
}

function getPatientName() {
    sql = file('patient.sql');
    sql = sql.replace(':sampleId', sample.id);
    p = select(sql);

    // сокращаем до инициалов все слова после 1
    words = p.text.split(' ');
    name = words[0] + ' ';
    for (i = 1; i < words.length; i++)
         name += words[i].charAt(0);
    return name;
}

function getBarcode() {
    b = barcode('Code128', sample.ids);
    return b.img;
}
