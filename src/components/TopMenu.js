import { ExportOutlined } from "@ant-design/icons";
import { useActor } from "@xstate/react";
import { Button, Card, Menu, Popover, Space, Tag, Typography } from "antd";
import { useEffect } from "react";
import { Profile } from "./Profile";


const { Text } = Typography;

const QueryPager = (sender, data) => (page, limit) => {
    page === undefined && (page = data.page);
    limit === undefined && (limit = data.limit);
    console.log(data, page, limit);

    const query = { data: { ...data, page, limit }, type: "LOAD" };
    return sender(query);
};

export function TopMenu({ actor }) {
    const [appState, sendApp] = [actor.getSnapshot(), actor.send];
    const [profileState, sendProfile] = useActor(appState.context.profileActor);

    const profileView = <Space direction="vertical">
        <div>
            <div>
                <Text type="secondary" strong>A-Code : </Text>
                <Text>&nbsp;{profileState.context.result.profile.partyId}</Text>
            </div>
            <div>
                <Text type="secondary" strong>User ID : </Text>
                <Text>&nbsp;{profileState.context.result.profile.loginId}</Text>
            </div>
        </div>
        <Button size="small" onClick={() => sendApp({ type: 'LOGOUT' })}><Text type="warning">logout</Text></Button>
    </Space>;

    useEffect(() => QueryPager(sendProfile, profileState.context.payload.data)(), []);

    return (
        <Menu
            mode="horizontal"
            className="menu"
            selectedKeys={[appState.value]}
        >
            
            <Popover content={profileView}>
                <Menu.Item key="profile" onClick={() => sendApp({ type: 'NAV_PROFILE' })}>
                    {profileState.context.result.profile.name}
                </Menu.Item>
            </Popover>
            <Menu.Item key="balance" className="balanceView"><strong>Balance: {profileState.context.result.balance} BDT</strong></Menu.Item>
        </Menu>
    );
}
