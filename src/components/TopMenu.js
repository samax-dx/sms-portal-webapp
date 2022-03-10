import { useActor } from "@xstate/react";
import { Menu } from "antd";

export function TopMenu({ actor }) {
    const [appState, send] = useActor(actor);

    return (
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[]} style={{ direction: "rtl" }}>
            <Menu.Item key="logout" onClick={() => send({ type: 'DO_LOGOUT' })}>Logout</Menu.Item>
            <Menu.Item key="profile" onClick={() => send({ type: 'NAV_PROFILE' })}>Profile</Menu.Item>
        </Menu>
    );
}
