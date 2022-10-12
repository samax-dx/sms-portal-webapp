export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

export const createOrUpdateMocked = (dataTable, idField, record) => {
    const rowIndex = dataTable.findIndex(r => r[idField] === record[idField]);

    if (rowIndex > -1) {
        dataTable[rowIndex] = { ...dataTable[rowIndex], ...record };
        return Promise.resolve(dataTable[rowIndex]);
    } else {
        record[idField] = Date.now() + "";
        dataTable.push(record);
        return Promise.resolve(record);
    }
};

export const deleteOneMocked = (dataTable, idField, record) => {
    const rowIndex = dataTable.findIndex(r => r[idField] === record[idField]);

    if (rowIndex > -1) {
        dataTable[rowIndex] = { ...dataTable[rowIndex], ...record };
        return Promise.resolve({ deleteCount: dataTable.splice(rowIndex, 1).length });
    } else {
        return Promise.resolve({ deleteCount: 0, errorMessage: "Record not found." });
    }
};
