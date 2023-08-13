import React, {useRef} from 'react';
import {Form, Select, Spin} from 'antd';
// import {GroupService} from "../services/ContactBook/GroupService";
import {ReportsService} from "../services/ReportsService";
import {PartyIdCatcher} from "./HomeNew";


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

export const DebounceSelectForRoute = ({ query, debounceTimeout = 500, ...props }) => {
    const partyId = PartyIdCatcher();
    const fetchOptions = () => ReportsService.findAllRouteForDropdown({partyId})
        .then(data =>
                [
                    { label: "All", value: '' }, // New option
                    ...data.map((r) => ({
                        label: `${r.ROUTE_ID}`,
                        value: r.ROUTE_ID,
                    })),
                ]
            // data.map((r) => ({
            //     label: `${r.ROUTE_ID}`,
            //     value: r.ROUTE_ID,
            // })),
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
        <Form.Item name="routeId" rules={[{ required: false }]} >
            <Select
                // ref={ref}
                style={{width:"150px", marginRight:'10px'}}
                showSearch
                filterOption={true}
                onSearch={debounceFetcher}
                notFoundContent={fetching ? <Spin size="small" /> : null}
                {...props}
                options={options}
                // onChange={() => ref.current.blur()}
            />
        </Form.Item>
    );
}
