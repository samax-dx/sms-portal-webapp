import {contactBookContacts} from "./services/ContactBook/ContactBookDB";

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

export const findListMocked = (dataTable, query, searchField, outputName) => {
    const records = dataTable.filter(record => record[searchField]?.toLowerCase().includes(query[searchField]?.toLowerCase() || ""));
    return {
        [outputName]: [...records.slice(((query.page || 1) - 1) * (query.limit || 10), (query.page || 1) * (query.limit || 10))],
        count: records.length
    };
};

export const createOrUpdateMocked = (dataTable, idField, record, __i=0) => {
    const rowIndex = dataTable.findIndex(r => r[idField] === record[idField]);

    if (rowIndex > -1) {
        dataTable[rowIndex] = {...dataTable[rowIndex], ...record};
        return Promise.resolve({record: dataTable[rowIndex]});
    } else {
        record[idField] = (Date.now() + __i) + "";
        dataTable.push(record);
        return Promise.resolve({record});
    }
};

export const createOrUpdateMockedMulti = (dataTable, idField, records) => {
    return new Promise((res, rej) => {
        const recordsRes = records.map((record, i) => createOrUpdateMocked(dataTable, idField, record, i));
        Promise.all(recordsRes).then(recordList => {
            res({records:recordList.map(item => ({...item.record, contactId: item.record.contactId}))});
        });
    });
};

export const deleteOneMocked = (dataTable, idField, record) => {
    const rowIndex = dataTable.findIndex(r => r[idField] === record[idField]);

    if (rowIndex > -1) {
        dataTable[rowIndex] = {...dataTable[rowIndex], ...record};
        return Promise.resolve({deleteCount: dataTable.splice(rowIndex, 1).length});
    } else {
        return Promise.resolve({deleteCount: 0, errorMessage: "Record not found."});
    }
};

export const unflatten = data => {
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
};
