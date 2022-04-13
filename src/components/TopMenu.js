import { useActor } from "@xstate/react";
import { Menu, Popover } from "antd";
import { Profile } from "./Profile";

export function TopMenu({ actor }) {
    const [appState, sendApp] = useActor(actor);

    const profileView = <Profile actor={appState.context.profileActor} appState />;
    const sendProfileActor = payload => appState.context.profileActor.send(payload);

    return (
        <Menu theme="dark" mode="horizontal" style={{ direction: "rtl" }} selectedKeys={[appState.value]}>
            <Menu.Item key="logout" onClick={() => sendApp({ type: 'LOGOUT' })}>Logout</Menu.Item>
            <Popover content={profileView}>
                <Menu.Item key="profile" onClick={() => sendApp({ type: 'NAV_PROFILE' })} onMouseEnter={() => sendProfileActor({ type: "LOAD" })}>Profile</Menu.Item>
            </Popover>
        </Menu>
    );
}
