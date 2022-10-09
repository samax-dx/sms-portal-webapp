import { Table, Tag, Space } from 'antd';

const data = [
    {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
        tags: ['nice', 'developer'],
    },
    {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
        tags: ['loser'],
    },
    {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
        tags: ['cool', 'teacher'],
    },
];
const columns = [
    {
        title: 'Serial no',
        dataIndex: 'name',
        key: 'name',
        render: text => <a>{text}</a>,
    },
    {
        title: 'Recepient Number',
        dataIndex: 'age',
        key: 'age',
    },
    {
        title: 'Status',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
            <Space size="middle">
                <a>Delete</a>
            </Space>
        ),
    },
];



const getData=()=>data;
export const CampaignTasks = () => <Table columns={columns} dataSource={getData()}/>;

