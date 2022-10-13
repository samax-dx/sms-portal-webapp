import React, {useRef} from 'react';
import {Form, Select, Spin} from 'antd';
import {GroupService} from "../services/ContactBook/GroupService";


const debounce = (cb, timeout = 300, _idle = true, _args) => (...args) => {
    if (_idle) {
        setTimeout(() => {
            cb(..._args);
            _idle = true;
        }, timeout);

        _idle = false;
    }

    _args = [...args];
};

export const DebounceSelect = ({ query, debounceTimeout = 500, ...props }) => {
    const fetchOptions = () => GroupService.fetchRecords({})
        .then(data =>
            data.groups.map((user) => ({
                label: `${user.groupId} - ${user.groupName}`,
                value: user.groupId,
            })),
        );
    const [fetching, setFetching] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const fetchRef = React.useRef(0);
    const ref = useRef();
    const debounceFetcher = React.useMemo(() => {
        const loadOptions = (value) => {
            fetchRef.current += 1;
            const fetchId = fetchRef.current;
            setOptions([]);
            setFetching(true);
            fetchOptions(value).then((newOptions) => {
                if (fetchId !== fetchRef.current) {
                    // for fetch callback order
                    return;
                }

                setOptions(newOptions);
                setFetching(false);
            });
        };

        return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);
    return (
        <Form.Item name="groupId" rules={[{ required: true }]} >
            <Select
                // ref={ref}
                showSearch
                filterOption={false}
                onSearch={debounceFetcher}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                {...props}
                options={options}
                // onChange={() => ref.current.blur()}
            />
        </Form.Item>
    );
}
