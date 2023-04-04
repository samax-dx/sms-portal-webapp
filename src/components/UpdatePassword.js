import React from 'react';
import {Button, Form, Input, notification} from 'antd';
import {XAuth} from "../services/XAuth";

const UpdatePassword = () => {
    const [updateForm] = Form.useForm();

    return (
        <Form name="basic" form={updateForm}
              labelCol={{
                  span: 8,
              }}
              wrapperCol={{
                  span: 8,
              }}
              initialValues={{
                  remember: true,
              }}
              autoComplete="off"
        >
            <Form.Item label="Current Password" name="password"
            >
                <Input.Password placeholder="Current Password"/>
            </Form.Item>
            <Form.Item label="New Password" name="passwordNew"
                       rules={[{required: true},
                           {
                               message: 'Password should contain at least a upper case,Lower case, symbol like (@$!%*#?&) & min length 8.',
                               validator: (_, value) => {
                                   if (/^^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/.test(value)) {
                                       return Promise.resolve();
                                   } else {
                                       return Promise.reject('Password should contain at least a upper case,Lower case, symbol like (@$!%*#?&) & min length 8.');
                                   }
                               }
                           }
                       ]}
            >
                <Input.Password placeholder="New Password"/>
            </Form.Item>
            <Form.Item
                required
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['passwordNew']}
                hasFeedback
                rules={[
                    ({getFieldValue}) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('passwordNew') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Passwords does not match!"));
                        },
                    })
                ]}
            >
                <Input.Password placeholder="Please confirm your password!"/>
            </Form.Item>
            <Form.Item
                wrapperCol={{
                    offset: 8,
                    span: 16,
                }}
            >
                <Button
                    type="primary" htmlType="submit"
                    onClick={() => updateForm
                        .validateFields()
                        .then(_ => XAuth.updatePassword(updateForm.getFieldsValue()))
                        .then(data => {
                            console.log(data);
                            notification.success({
                                key: `cpassword_${Date.now()}`,
                                message: "Password Succesfully Updated",
                                duration: 5
                            });
                            updateForm.resetFields();
                        })
                        .catch(error => {
                            console.log(error);
                            notification.error({
                                key: `cgroup_${Date.now()}`,
                                message: "Task Failed",
                                description: <>{error.message}</>,
                                duration: 5
                            });
                        })
                    }
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};
export default UpdatePassword;