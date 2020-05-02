util.saving = (function () {

    const save_to_file = function(filePath, data_fn) {
        return fs.writeFile(filePath, data_fn())
            .then(() => { return {state: 'success'} });
    };

    const save_to_csv = function(data_array_fn) {
        return dialog.showSaveDialog({
            filters: [
                { name: 'CSV', extensions: ['csv'] }
            ]
        }).then(result => {
            if (!result.canceled) {
                return save_to_file(result.filePath, () => convertArrayToCSV(data_array_fn()));
            } else {
                return {state: 'canceled'};
            }
        });
    };

    return {
        save_to_csv: save_to_csv
    }
}());