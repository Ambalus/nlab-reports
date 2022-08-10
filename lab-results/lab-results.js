/**
 * Функции для работы с html
 * */
function node(tag) {
    return document.createElement(tag)
}

/*varargs не работает :-(*/
function tr(nodes) {
    var tr = node('tr');
    if (nodes) nodes.forEach(function (node) {
        tr.appendChild(node);
    })
    return tr;
}

function td(text) {
    text = text ? text : '';
    return node('td').text(text);
}

function tdBold(text) {
    return td(text).attr('style', 'font-weight:bold');
}

function th(text) {
    text = text ? text : '';
    return node('th').text(text);
}

function img(src) {
    return node('img').attr('src', src);
}

function appendChildren(root, nodes) {
    if (nodes) nodes.forEach(function (node) {
        root.appendChild(node);
    });
}

/**
 * Функции для работы с объектами js
 * */
function containsId(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id && array[i].id.equals(id)) {
            return true;
        }
    }
    return false;
}

function containsTextAndIdx(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].text.equals(element.text) && array[i].idx.equals(element.idx)) {
            return true;
        }
    }
    return false;
}

function filterById(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id.equals(id)) {
            return array[i];
        }
    }
    return null;
}

function indexOf(array, id) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].id && array[i].id.equals(id)) {
            return i;
        }
    }
    return null;
}

function indexByText(array, text) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].text && array[i].text.equals(text)) {
            return i;
        }
    }
    return null;
}

function div(val, by) {
    return (val - val % by) / by;
}

/**
 * Функции для создания запросов
 * В запросах для исключения фрагментов используется последовательность символов "---"
 */
function prepareQuery(path) {
    var sql = file(path).replaceAll(':sampleId', sample.id);
    if (researches.length > 0) {
        sql = sql.replaceAll('---', '');
        sql = sql.replaceAll(':researches', listString());
    }
    return sql;
}

function listString() {
    var listString = "";
    researches.forEach(function (serv) {
        listString += serv;
        listString += ', ';
    });
    return listString.substring(0, listString.length - 2);
}

/**
 * Функции для отчёта
 */
/**
 * Заголовок отчёта (инфа о пациенте)
 */
function orderHeader() {
    var headerTable = element;
    headerTable.html('');
    var header = select(prepareQuery('orderHeader.sql'));
    if (!header) {
        return;
    }

    var patNum = '№' + header.PATIENT_NUM;
    var srcText = header.SOURCE_TEXT ? header.SOURCE_TEXT : '';
    var fio = header.PATIENT_TEXT;
    var patInfo = sex(header.PATIENT_SEX) + ', ' + age(header.PATIENT_BIRTH_DATE, header.COLLECT_DATE);

    var tr1 = tr([
        tdBold(patNum).attr('width', '40%'),
        td(),
        td('Отдел.:').attr('nowrap', 'nowrap').attr('width', '62px'),
        td(srcText).attr('rowspan', '3').attr('nowrap', 'nowrap').attr('width', '285px')
    ]);
    var tr2 = tr([
        tdBold(fio).attr('style', 'font-size: 16px; font-weight:bold')
    ]);
    var tr3 = tr([
        tdBold(patInfo)
    ]);
    appendChildren(headerTable, [tr1, tr2, tr3]);

    if (header.CUSTOM_DATA) {
        var customData = JSON.parse(header.CUSTOM_DATA);
		customData.forEach(function (data) {
			var dataRow = tr([
				td(data.text),
				td(data.value).attr('colspan', '3'),
			]);
			appendChildren(headerTable, [dataRow]);
		});
	}
}

/**
 * Примечания к услугам
 */
function servNotes() {
    servNotes = selectList(prepareQuery('servNotes.sql'));
    element.html('')
    if (!servNotes) {
        return;
    }

    var table = node('table').attr('id', 'serv-notes');
    servNotes.forEach(function (note) {
        table.appendChild(
            tr([
                td(note.TEXT)
            ])
        );
    });

    element.html(table);
}

/**
 * Инфа об образце
 */
function sampleInfo() {
    var infoTable = element;
    sampleInfo = select(prepareQuery('sampleInfo.sql'));
    infoTable.html('')
    if (!sampleInfo) {
        return;
    }

    var barcodeSrc = "data:image/png;base64," + barcode("Code128", sampleInfo.IDS);
    var specimen = sampleInfo.SPECIMEN;
    var collectPlace = sampleInfo.COLLECT_PLACE ? ' (' + sampleInfo.COLLECT_PLACE + ')' : '';
    var regDate = formatDate(sampleInfo.REG_DATE);
    var deliveryDate = formatDate(sampleInfo.DELIVERY_DATE);
    var collectDate = formatDate(sampleInfo.COLLECT_DATE);
    var resultDate = formatDate(sampleInfo.RESULT_DATE);
    var ids = sampleInfo.IDS;

    var tr1 = tr([
        td('').attr('rowspan', '2').attr('align', 'left').attr('width', '1%').attr('style', 'vertical-align: middle').appendChild(
            img(barcodeSrc).attr('width', '200px')
        ),
        td('').attr('rowspan', '2').appendChild(
            node('span').text(specimen).attr('style', 'font-weight:bold')
        ).appendChild(
            node('span').text(collectPlace)
        ),
        td('Регистр:').attr('nowrap', 'nowrap').attr('width', '62px'),
        td(regDate).attr('nowrap', 'nowrap').attr('width', '110px'),
        td('Доставка:').attr('nowrap', 'nowrap').attr('width', '62px'),
        td(deliveryDate).attr('nowrap', 'nowrap').attr('width', '110px'),
    ]);

    var tr2 = tr([
        td('Взятие:'),
        td(collectDate),
        td('Результат:'),
        td(resultDate),
    ]);

    var tr3 = tr([
        td(ids).attr('align', 'center').attr('style', 'vertical-align: middle')
            .attr('style', 'font-size: 16px; font-weight:bold')
    ]);

    appendChildren(infoTable, [tr1, tr2, tr3])
}

var cancelInfoCache = null;
function getCancelInfo() {
    if (!cancelInfoCache)
        cancelInfoCache = select(prepareQuery('cancelInfo.sql'));
    return cancelInfoCache;
}

/**
 * Образец аннулирован
 */
function cancelInfo() {
    var cancelInfo = getCancelInfo();
    element.html('');
    if (!cancelInfo) {
        return;
    }

    var tr1 = tr([
        tdBold('ПРОБА АННУЛИРОВАНА').attr('colspan', '2')
    ]);
    element.appendChild(tr1);

    if (cancelInfo.CANCEL_DATE) {
        var tr2 = tr([
            td('Дата').attr('width', '10%'),
            td(formatDate(cancelInfo.CANCEL_DATE))
        ])
        element.appendChild(tr2);
    }

    if (cancelInfo.CANCEL_REASON) {
        var tr3 = tr([
            td('Причина').attr('width', '10%'),
            td(cancelInfo.CANCEL_REASON)
        ])
        element.appendChild(tr3);
    }
}

/**
 * Шапка таблицы антибиотикограммы
 */
function abHeader(sirBacterias) {
    var tHead = node('thead');
    /*
    Подзаголвок со словами SIR MIC DIA, SIR MIC DIA, ...
    печатаем под каждой бактерией только в том случае
    если хоть у одной бактерии есть значения MIC или DIA

    Если только значения SIR, то печатаем без подзаголовка
     */
    var printSubheader = false;
    sirBacterias.forEach(function (bac) {
        if (bac.colspan > 1) {
            printSubheader = true;
        }
    });

    var thAb = th('Антибиотик').attr('align', 'left').attr('width', '250px').attr('style', 'padding-left: 25px');
    if (printSubheader) {
        thAb.attr('rowspan', '2');
    }
    var thRow1 = tr([thAb]).attr('align', 'left').attr('class', 'tr-border');

    sirBacterias.forEach(function (bac) {
        var bacName = th(bac.text).attr('style', 'border-left: solid lightgrey 1px').attr('align', 'center').attr('colspan', bac.colspan);
        thRow1.appendChild(bacName)
    });
    tHead.appendChild(thRow1);

    if (printSubheader) {
        var thRow2 = tr().attr('class', 'tr-border');
        sirBacterias.forEach(function (bac) {
            thRow2.appendChild(th('SIR').attr('align', 'center').attr('style', 'border-left: solid lightgrey 1px').attr('width', '40px').attr('nowrap', 'nowrap'));
            if (bac.hasMic) {
                thRow2.appendChild(th('MIC').attr('align', 'center').attr('width', '40px').attr('nowrap', 'nowrap'));
            }
            if (bac.hasDia) {
                thRow2.appendChild(th('DIA').attr('align', 'center').attr('width', '40px').attr('nowrap', 'nowrap'));
            }
        });
        tHead.appendChild(thRow2);
    }
    return tHead;
}

/**
 *  Проверяет, нужно ли добавить колонку в общую МБИО-таблицу
 */
function addColumn(col, sirBacterias) {
    // добавляем ячейки только если
    return sirBacterias[div(col - 1, 3)] &&
        (col == 0 // это название антибиотика
            || (col - 1) % 3 == 0 // это столбец SIR
            || (col - 1) % 3 == 1 && sirBacterias[div(col - 1, 3)].hasMic // это непустой столбец MIC
            || (col - 1) % 3 == 2 && sirBacterias[div(col - 1, 3)].hasDia); // это непустой столбец DIA
}

/**
 * Таблица результатов антибиотикограммы
 */
function antibioticogramTable(sirBacterias, rows) {
    /*
    * Табличка с заголовком "АНТИБИОТИКОГРАММА" непосредственно над таблицей с аб/граммой
    * */
    var div = node('div');
    var title = node('table');
    var trTitle = tr([
        td('АНТИБИОТИКОГРАММА').attr('style', 'font-weight:bold; padding-top:10px; padding-bottom:10px')
    ]);
    title.appendChild(trTitle);
    div.appendChild(title);

    var abTable = node('table').attr('id', 'ab-table');
    var tHead = abHeader(sirBacterias);
    var tBody = node('tBody')

    rows.forEach(function (row) {
        var sirRow = tr();
        for (var col = 0; col < row.length; col++) {
            if (addColumn(col, sirBacterias)) {
                var sirValue = td(row[col] ? row[col] : '');
                if (col == 0) { // название антибиотика
                    sirValue.attr('style', 'padding-left:25px');
                } else if ((col - 1) % 3 == 0) { // столбдец SIR
                    sirValue.attr('style', 'border-left: solid lightgrey 1px').attr('align', 'center');
                } else {
                    sirValue.attr('align', 'center');
                }
                sirRow.appendChild(sirValue);
            }
        }
        tBody.appendChild(sirRow);
    });

    appendChildren(abTable, [tHead, tBody]);
    div.appendChild(abTable);
    return div;
}

/**
 * Функция вывода всех МБИО-результатов по одному МБИО-ресерчу.
 * В дальнейшем делится на вывод результатов о микроорганизмах и результатов чувствительности к АБ
 */
function drawMbioResultTable(res) {
    var mbioResultsTable = node('table').attr('id', 'mbio').attr('width', '100%');
    var tHead = node('thead');
    var thRow = tr([
        th().attr('width', '23px'),
        th('Культура'),
        th('КОЕ / Рост').attr('width', '20%'),
        th('Норма').attr('width', '20%')
    ]);

    var tBody = node('tbody');

    var lastGroup = '';
    var lastBacteriaId = -1;
    res.forEach(function (bac) {
        /*Заголовок группы бактерий*/
        if (bac.GROUP_TEXT && bac.GROUP_TEXT != lastGroup) {
            lastGroup = bac.GROUP_TEXT;
            var groupHeader = th(lastGroup).attr('colspan', '4');
            tBody.appendChild(tr([groupHeader]).attr('align', 'center'))
        }
        /*Название бактерий*/
        if (bac.ID - lastBacteriaId != 0) { // по-другому не сравнивает
            var bacPatTd = td('');
            if (bac.PHEN_PAT) {
                bacPatTd.appendChild(img('pathology.png').attr('class', 'pat'))
            }
            var bacTr = tr([
                bacPatTd,
                td(bac.TEXT),
                td(formatValue(bac.GROWTH, null)),
                td(formatValue(bac.NORM, null))
            ]);
            appendChildren(tBody, [bacTr]);
            lastBacteriaId = bac.ID;
        }
        /*Фенотипы*/
        if (bac.PHEN_TEXT) {
            var phenTr = tr([
                td(''),
                td(bac.PHEN_TEXT).attr('colspan', '2'),
                td(bac.PHEN_VAL)
            ]);
            appendChildren(tBody, [phenTr])
        }
    });

    appendChildren(tHead, [thRow]);
    appendChildren(mbioResultsTable, [tHead, tBody]);
    return mbioResultsTable;
}

/**
 * Общая таблица результатов МБИО
 */
function mbioResults() {
    var span = element;
    span.html('');
    if (getCancelInfo())
        return;

    var mbioResults = selectList(prepareQuery('mbioResults.sql'));
    if (!mbioResults) {
        return;
    }
    /**
     * Делим на отдельные блоки по разным mbio_research.id
     * Каждый блок будем выводить отдельно
     * */
    var mrIds = selectList(prepareQuery('mbioResearches.sql'));
    var abResults = selectList(prepareQuery('abResults.sql'));
    var mbioNotes = selectList(prepareQuery('mbioConclusion.sql'));

    // по каждому мбио ресерчу отдельно:
    mrIds.forEach(function (research) {

        var researchResults = [];
        mbioResults.forEach(function (result) {
            if (result.MR_ID - research.MR_ID == 0) {
                researchResults.push(result);
            }
        });

        var researchAbResults = [];
        if (abResults) {
            abResults.forEach(function (result) {
                if (result.MR_ID - research.MR_ID == 0) {
                    researchAbResults.push(result);
                }
            });
        }

        var researchNotes = [];
        if (mbioNotes) {
            mbioNotes.forEach(function (note) {
                if (note.MR_ID - research.MR_ID == 0) {
                    researchNotes.push(note);
                }
            });
        }

        /**
         * Заголовок с названием исследования
         */
        if (researchResults.length + researchAbResults.length + researchNotes.length > 0) {
            var title = node('table').attr('width', '100%');
            var trTitle = tr([
                th('РЕЗУЛЬТАТЫ МИКРОБИОЛОГИЧЕСКОГО ИССЛЕДОВАНИЯ').attr('style', 'padding-top:10px; padding-bottom:10px')
                    .attr('colspan', '2')
            ]);
            title.appendChild(trTitle)
            if (research.RESEARCH_TEXT) {
                var researchName = tr([
                    th('Исследование').attr('width', '20%').attr('style', 'vertical-align:top; padding-bottom:10px'),
                    td(research.RESEARCH_TEXT).attr('style', 'vertical-align:top')
                ]);
                title.appendChild(researchName);
            }
            span.appendChild(title);
        }

        /**
         * Таблица с бактериями
         */
        if (researchResults.length > 0) {
            span.appendChild(drawMbioResultTable(researchResults));
        }

        /**
         * Таблица с антибиотиками
         */
        if (researchAbResults.length > 0) {
            span.appendChild(drawAbResultTable(researchAbResults));
        }

        /**
         * Таблица с примечаниями и заключением
         */
        if (researchNotes.length > 0) {
            for (var i = 0; i < researchNotes.length; i++) {
                var note = researchNotes[i];
                var notesTable = node('table');
                var tBody = node('tbody');
                var tag = td(note.TAG).attr('width', '15%').attr('align', 'left').attr('style', 'vertical-align:top');
                var text = td(note.TEXT).attr('width', '85%').attr('style', 'vertical-align:top');
                if (i == 0) {
                    tag.attr('style', 'vertical-align:top; padding-top:10px')
                    text.attr('style', 'vertical-align:top; padding-top:10px')
                } else if (i == researchNotes.length - 1) {
                    tag.attr('style', 'vertical-align:top; padding-bottom:10px')
                    text.attr('style', 'vertical-align:top; padding-bottom:10px')
                }
                var recTr = tr([tag, text]);
                tBody.appendChild(node('tbody').appendChild(recTr));
                notesTable.appendChild(tBody);
                span.appendChild(notesTable);
            }
        }
    });
}


/**
 * Эта функция распределяет бактерии и антибиотики по наборам, не более 4х бактерий в каждом наборе
 * Чтобы впоследствии их вывести группами по 4 штуки
 * */
function groupIntoSets(abResults, sirBacterias, sirSetIndex, antibiotics) {
    var result = {};
    abResults.forEach(function (res) {
        if (res.ANTIBIOTIC_ID) {
            var sirBacteria;
            if (containsId(sirBacterias, res.ID)) {
                sirBacteria = filterById(sirBacterias, res.ID)
                sirSetIndex = sirBacteria.idx;
            } else {
                sirBacteria = {};
                sirBacteria.id = res.ID;
                sirBacteria.text = res.TEXT;

                sirBacteria.colspan = 1;
                if (sirBacterias.length % 4 == 0 && sirBacterias.length != 0) {
                    sirSetIndex++;
                }
                sirBacteria.idx = sirSetIndex;
                sirBacterias.push(sirBacteria);
            }
            if (!sirBacteria.hasMic && res.MIC) {
                sirBacteria.hasMic = true;
                sirBacteria.colspan++;
            }
            if (!sirBacteria.hasDia && res.DIA) {
                sirBacteria.hasDia = true;
                sirBacteria.colspan++;
            }

            var antibiotic = {};
            antibiotic.id = res.ANTIBIOTIC_ID;
            antibiotic.text = res.ANTIBIOTIC_TEXT;
            antibiotic.idx = sirSetIndex;
            if (!containsTextAndIdx(antibiotics, antibiotic)) {
                antibiotics.push(antibiotic);
            }
        }
    });

    /*коллекция наборов бактерий с чувствительностью, по 4 бактерии в каждом наборе*/
    var sirBacteriaSets = [];
    sirBacterias.forEach(function (bac) {
        sirBacteriaSets[bac.idx] = sirBacteriaSets[bac.idx] ? sirBacteriaSets[bac.idx] : [];
        sirBacteriaSets[bac.idx].push(bac);
    });

    /*коллекция наборов антибиотиков, каждый набор относится к бактериям из своей таблицы*/
    var antibioticSets = [];
    antibiotics.forEach(function (ab) {
        antibioticSets[ab.idx] = antibioticSets[ab.idx] ? antibioticSets[ab.idx] : [];
        antibioticSets[ab.idx].push(ab);
    });

    result.sirSetIndex = sirSetIndex;
    result.sirBacteriaSets = sirBacteriaSets;
    result.antibioticSets = antibioticSets;
    return result;
}

/**
 * Подготовка результатов антибиотикограммы для вывода
 * Маппинг в двумерный массив:
 * *--------------------------------------*
 * ! Антибиотик ! Бактерия 1 ! Бактерия 2 !
 * !            ! SIR ! MIC  ! SIR  ! DIA !
 * !------------+-----+------!------!-----!
 * !  А/б №1    !  S  !  12  !  S   !  27 !
 * !  А/б №2    !  R  !  2   !  S   !  24 !
 * *--------------------------------------*
 */
function drawAbResultTable(abResults) {
    var abMainTable = node('table');//id="ab-results" width="100%"
    abMainTable.attr('id', 'ab-results').attr('width', '100%');
    /*коллекция всех бактерий, с антибиотиками и без*/
    var sirBacterias = [];
    var antibiotics = [];
    var sirSetIndex = 0;
    var x = groupIntoSets(abResults, sirBacterias, sirSetIndex, antibiotics);

    for (var idx = 0; idx <= x.sirSetIndex; idx++) {
        var rows = [];

        for (var resId = 0; resId < abResults.length; resId++) {
            var mbioResult = abResults[resId]
            if (mbioResult.ANTIBIOTIC_TEXT) {
                rowIndex = indexByText(x.antibioticSets[idx], mbioResult.ANTIBIOTIC_TEXT);
                colIndex = indexOf(x.sirBacteriaSets[idx], mbioResult.ID);
                if (colIndex == null || rowIndex == null) {
                    continue;
                }
                colIndex = colIndex * 3 + 1;
                var length = x.sirBacteriaSets[idx].length * 3 + 1;

                if (!rows[rowIndex]) {
                    rows[rowIndex] = new Array(length);
                    for (var i = 0; i < length; i++) {
                        rows[rowIndex][i] = null;
                    }
                }

                rows[rowIndex][0] = mbioResult.ANTIBIOTIC_TEXT;
                rows[rowIndex][colIndex] = (mbioResult.SIR) ? mbioResult.SIR : '—';
                rows[rowIndex][colIndex + 1] = mbioResult.MIC;
                rows[rowIndex][colIndex + 2] = mbioResult.DIA;
            }
        }

        var abTableDiv = antibioticogramTable(x.sirBacteriaSets[idx], rows);
        abMainTable.appendChild(abTableDiv);
    }
    return abMainTable;
}

/**
 * Результаты обычных исследований
 */
function measures() {
    var measuresTable = element;
    measuresTable.html('');

    if (getCancelInfo())
        return;

    var measuresList = selectList(prepareQuery('measures.sql'));
    if (!measuresList) {
        return;
    }

    var tHead = node('thead');
    var tHeadRow = tr([
        th().attr('width', '25px'),
        th('Показатель'),
        th('Значение').attr('width', '20%'),
        th('Единицы измерения').attr('width', '20%'),
        th('Реф. интервал').attr('width', '20%'),
    ]);
    tHead.appendChild(tHeadRow);
    measuresTable.appendChild(tHead);

    var lastGroup = '';
    measuresList.forEach(function (msr) {
        var tBody = node('tbody');

        if (msr.GROUP_TEXT && msr.GROUP_TEXT != lastGroup) {
            lastGroup = msr.GROUP_TEXT;
            var groupTr = tr([
                th(lastGroup).attr('colspan', '5')
            ]);
            tBody.appendChild(groupTr);
        }

        var patTd = td();
        if (msr.PAT != 0) {
            patTd.appendChild(img('pathology.png').attr('class', 'pat'))
        }

        var msrTr = tr([
            patTd,
            td(msr.TEXT),
            td(msr.VALUE),
            td(msr.UNITS),
            td(msr.NORM)
        ]);
        tBody.appendChild(msrTr);

        if (msr.NOTE) {
            var noteTr = tr([
                td(),
                td(),
                td(msr.NOTE).attr('colspan', '3')
            ]);
            tBody.appendChild(noteTr);
        }
        measuresTable.appendChild(tBody);
    });
}

/**
 * Исполнители
 */
function executors() {
    element.html('');

    if (getCancelInfo())
        return;

    var executorsList = selectList(prepareQuery('executors.sql'));
    if (executorsList) {
        var text = '';
        for (var i = 0; i < executorsList.length; i++) {
            var exec = executorsList[i];
            text += exec.TEXT;
            if (i != executorsList.length - 1) {
                text += ', ';
            }
        }
        element.appendChild(
            tr([
                th('Выполнено').attr('width', '15%').attr('align', 'left').attr('style', 'padding-top:10px'),
                td(text).attr('style', 'padding-top:10px')
            ])
        );
    }

    var validatorsList = selectList(prepareQuery('validators.sql'));
    if (validatorsList) {
        var text = '';
        for (var i = 0; i < validatorsList.length; i++) {
            var val = validatorsList[i];
            text += val.TEXT;
            if (i != validatorsList.length - 1) {
                text += ', ';
            }
        }
        element.appendChild(
            tr([
                th('Проверено').attr('width', '15%').attr('align', 'left').attr('style', 'padding-top:10px'),
                td(text).attr('style', 'padding-top:10px')
            ])
        );
    }
}

function undone() {
    element.html('');
    var undoneSrvs = selectList(prepareQuery('undone.sql'));
    if (!undoneSrvs || undoneSrvs.length == 0) {
        return;
    }

    var header = th('НЕ ВЫПОЛНЕНО').attr('colspan', '3').attr('align', 'center');
    element.appendChild(tr([header]));
    undoneSrvs.forEach(function (srv) {
        var srvRow = tr([
            td(srv.CODE).attr('width', '15%'),
            td(srv.TEXT),
            td(srv.STATUS == 1 ? 'Отменена' : 'В работе')
        ]);
        element.appendChild(srvRow);
    });
}

/**
 * Результат исследования не является диагнозом бла бла бла
 */
function disclaimer() {
    element.html('');
    var tBody = node('tbody');
    var disclaimerBody = string('disclaimer-body');
    var header = tr([
        th(string('disclaimer-header')).attr('align', 'center').attr('style', 'padding-top: 10px')
    ]);
    var textBody = tr([
        td(disclaimerBody).attr('align', 'center')
    ]);
    appendChildren(tBody, [header, textBody]);
    element.appendChild(tBody);
}

/**
 * Подпись, печать
 */
function stamp() {
    element.html('');
    var tBody = node('tbody');
    var fio = string('zavlab-fio');

    var tr1 = tr([
        td(),
        td().attr('style', 'width: 1%')
            .appendChild(img('sign.png')),
        td().attr('style', 'width: 1%').attr('rowspan', '2')
            .appendChild(img('stamp.png')),
    ]);
    var tr2 = tr([
        td(),
        td(fio).attr('style', 'width: 1%; white-space: nowrap;')
    ]);
    appendChildren(tBody, [tr1, tr2]);
    element.appendChild(tBody);
}

/**
 * Верхний колонтитул
 */
function pageHeader() {
    element.html('');
    var tBody = node('tbody');
    var tr1 = tr([
        td().attr('rowspan', '3').appendChild(img('../common/logo.png')),
        th(string('lpuName')).attr('align', 'right')
    ]);
    var tr2 = tr([
        td(string('lpuAddress')).attr('align', 'right')
    ])
    var tr3 = tr([
        td(string('lpuPhone')).attr('align', 'right')
    ])
    appendChildren(tBody, [tr1, tr2, tr3]);
    element.appendChild(tBody);
}
/**
 * Нижний колонтитул
 */
function pageFooter() {
    element.html('');
    var span1 = node('span').text('Ариадна.NLab | ')
    var span2 = node('span').text(now('dd.MM.yyyy HH:mm:ss'));
    appendChildren(element, [span1, span2]);
}
