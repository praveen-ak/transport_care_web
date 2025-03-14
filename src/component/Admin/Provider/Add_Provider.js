import React from 'react'
import { Layout, Form, Input, Button, message, Typography, Row, Col, Select, Checkbox } from 'antd';
import { SUBCATEGORY_NAME, CATEGORY_NAME } from '../../../graphql/Admin/sub_category';
import { ADD_USER, FIND_USER, UPDATE_USER } from '../../../graphql/Admin/user';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';
import AdminSider from '../Layout/AdminSider';
import AdminHeader from '../Layout/AdminHeader';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { client } from "../../../apollo";
import '../../../scss/template.scss';
import '../../../scss/Category.scss';
import { Alert_msg } from '../../Comman/alert_msg';
import Geocode from "react-geocode";
const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
Geocode.setApiKey("AIzaSyCSU1q0Xi_lp-pgthdS370X33k3eza9Bu0");


class Add_Provider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            loading: false,
            imageUrl: '',
            update: 0,
            update_data: {},
            file: {},
            previewVisible: false,
            previewImage: '',
            pagination: {
                pageSize: 5,
                current: 1,
                total: 0,
                simple: true,
            },
            OPTIONS: ['Apples', 'Nails', 'Bananas', 'Helicopters'],
            category: [],
            address: '',
            certificate: [],
            country_code: "",
            m_no: '',
            demo: false,
            _phone: ''
        };

    }
    componentDidMount() {
        const { form } = this.props;
        form.resetFields();
        this.setState({ imageUrl: '' })
        this.fetch_subcategory();
        this.fetch_category();
        if (this.props.match.params.id !== undefined) {
            this.fetch_find_user();
        }
    }
    fetch_subcategory = async () => {
        await client.query({
            query: SUBCATEGORY_NAME,
            fetchPolicy: 'no-cache',
        }).then(result => {
            console.log(result);
            this.setState({ category: [...this.state.category, ...result.data.sub_category] });
        });
    }
    fetch_category = async () => {
        await client.query({
            query: CATEGORY_NAME,
            variables: { is_parent: false },
            fetchPolicy: 'no-cache',
        }).then(result => {
            this.setState({ category: [...result.data.category, ...this.state.category], certificate: result.data.category[0] ? result.data.category[0].Certificate : [] });
        });
    }
    find_address = async (lat, lng) => {
        Geocode.fromLatLng(lat, lng).then(
            response => {
                const address = response.results[0].formatted_address;
                console.log(address);
                this.setState({ address })
            },
            error => {
                console.error(error);
            }
        );
    }
    fetch_find_user = async () => {
        await client.query({
            query: FIND_USER,
            variables: { _id: this.props.match.params.id },
            fetchPolicy: 'no-cache',
        }).then(result => {
            console.log(result);
            if (Array.isArray(result.data?.user[0]?.location?.coordinates)) {
                this.find_address(result.data?.user[0]?.location?.coordinates[0], result.data?.user[0]?.location?.coordinates[1]);
            }
            this.setState({
                update: 1,
                update_data: result.data.user[0],
                m_no: result.data?.user[0].phone_no,
                country_code: result.data?.user[0].country_code,
                _phone: `+${result.data?.user[0].country_code} ${result.data?.user[0].phone_no}`,
                address: result.data.user[0].address,
                demo: result.data.user[0].demo
            });
        });
    }
    normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            console.log(info.file.originFileObj);
            this.setState({ file: info.file.originFileObj });
            this.getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                }),
            );
        }
    };

    add_provider = () => {
        const { form, history } = this.props;
        form.validateFields(async (err, values) => {
            console.log(values);
            if (!err) {
                await client.mutate({
                    mutation: ADD_USER,
                    variables: {
                        role: 2,
                        country_code: this.state.country_code,
                        phone_no: this.state.m_no,
                        email: values.email,
                        password: values.password,
                        name: values.provider_name,
                        lat: this.state.lat_lng.lat,
                        lng: this.state.lat_lng.lng,
                        address: this.state.address,
                        provider_subCategoryID: values.category_name,
                        demo: this.state.demo
                    },
                }).then((result, loading, error) => {
                    console.log(result);
                    Alert_msg(result.data.admin_add_user.info);
                    if (result.data.admin_add_user.info.status === "success") {
                        history.push('/admin-provider');
                    }
                });
            }
        });
    };

    update_provider = () => {
        const { form, history } = this.props;
        form.validateFields(async (err, values) => {
            var datas = {}
            if (values.phone.length > 10) {
                datas = { role: 2, demo: this.state.demo,
                     country_code: this.state.country_code, phone_no: this.state.m_no, email: values.email, password: values.password, name: values.provider_name, lat: this.state.lat_lng ? this.state.lat_lng.lat : undefined, lng: this.state.lat_lng ? this.state.lat_lng.lng : undefined, address: this.state.address, provider_subCategoryID: values.category_name, _id: this.props.match.params.id };
            } else {
                datas = { role: 2, demo: this.state.demo, email: values.email, password: values.password, name: values.provider_name, lat: this.state.lat_lng ? this.state.lat_lng.lat : undefined, lng: this.state.lat_lng ? this.state.lat_lng.lng : undefined, address: this.state.address, provider_subCategoryID: values.category_name, _id: this.props.match.params.id };
            }
            if (!err) {
                console.log(this.state.lat_lng);
                await client.mutate({
                    mutation: UPDATE_USER,
                    variables: datas
                }).then((result, loading, error) => {
                    Alert_msg(result.data.admin_update_user.info);
                    if (result.data.admin_update_user.info.status === "success") {
                        history.push('/admin-provider');
                    }
                });
            }
        });
    };
    handleChange1 = address => {
        this.setState({ address });
    };

    handleSelect = address => {
        console.log(address);
        this.setState({ address });
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => this.setState({ lat_lng: latLng }))
            .catch(error => console.error('Error', error));
    };
    render() {
        const { form } = this.props;

        console.log(this.state.update_data.subCategory_name);
        return (
            <Layout style={{ height: '100vh' }}>
                <AdminSider update_collapsed={this.state.collapsed} />
                <Layout>
                    <AdminHeader />
                    <Content className="main_frame">
                        <Row gutter={[24, 24]}>
                            <Col span={24}>
                                <Title level={3}>Add Provider</Title>
                            </Col>
                        </Row>
                        <Row>
                            <Form>
                                <Col span={24}>
                                    <Row gutter={12}>
                                        <Col span={12}>
                                            <Form.Item label="Category Name">
                                                {form.getFieldDecorator("category_name", {
                                                    initialValue: this.state.update_data.provider_subCategoryID,
                                                    rules: [{ required: true }]
                                                })(<Select mode="multiple" style={{ width: '100%' }} placeholder="Please select Category" onChange={(value) => { console.log(value); }}>
                                                    {this.state.category.map(data =>
                                                        <Option key={data._id}>{data.subCategory_name ? data.subCategory_name : data.category_name ? data.category_name : ''}</Option>
                                                    )}
                                                </Select>)}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Provider Name">
                                                {form.getFieldDecorator("provider_name", {
                                                    initialValue: this.state.update_data.name,
                                                    rules: [{ required: true }]
                                                })(<Input placeholder="Name" />)}
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row className="py-3" gutter={12}>
                                        <Col className="" lg={12}>
                                            <Form.Item label="Phone">
                                                {form.getFieldDecorator("phone", {
                                                    initialValue: this.state._phone,
                                                    rules: [{ required: true, message: 'Phone no is required' }]
                                                })(<PhoneInput
                                                    placeholder="phone no"
                                                    country={'in'}
                                                    value={this.state.phone}
                                                    onChange={(value, data, event) => {
                                                        console.log(data);
                                                        this.setState({
                                                            m_no: value.replace(/[^0-9]+/g, '').slice(data.dialCode.length),
                                                            country_code: data.dialCode
                                                        });
                                                    }}
                                                />
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col className="" lg={12}>
                                            <Form.Item label="Location">
                                                {form.getFieldDecorator("location", {
                                                    initialValue: this.state.update_data.address,
                                                    rules: [{ required: true }]
                                                })(<PlacesAutocomplete
                                                    value={this.state.address}
                                                    onChange={this.handleChange1}
                                                    onSelect={this.handleSelect}
                                                >
                                                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                                        <div>
                                                            <input
                                                                {...getInputProps({
                                                                    placeholder: 'Search Places ...',
                                                                    className: 'location-search-input ant-input',
                                                                })}
                                                                value={this.state.address}
                                                            />
                                                            <div className="autocomplete-dropdown-container">
                                                                {loading && <div>Loading...</div>}
                                                                {suggestions.map(suggestion => {
                                                                    const className = suggestion.active
                                                                        ? 'suggestion-item--active'
                                                                        : 'suggestion-item';
                                                                    // inline style for demonstration purpose
                                                                    const style = suggestion.active
                                                                        ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                                                        : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                                                    return (
                                                                        <div
                                                                            {...getSuggestionItemProps(suggestion, {
                                                                                className,
                                                                                style,
                                                                            })}
                                                                        >
                                                                            <span>{suggestion.description}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </PlacesAutocomplete>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row className="py-3" gutter={12}>

                                        <Col className="" lg={12}>
                                            <Form.Item label="Email">
                                                {form.getFieldDecorator("email", {
                                                    initialValue: this.state.update_data.email,
                                                    rules: [{ required: true }]
                                                })(<Input placeholder="Email" />)}
                                            </Form.Item>
                                        </Col>
                                        <Col className="" lg={12}>
                                            <Form.Item label="Password">
                                                {form.getFieldDecorator("password", {
                                                    initialValue: this.state.update_data.password,
                                                    rules: [{ required: true }]
                                                })(<Input.Password placeholder="Password" />)}
                                            </Form.Item>
                                        </Col>


                                        <Col span={24}>
                                            <Form.Item className="float-left">
                                                <Checkbox checked={this.state.demo} onChange={(e) => { this.setState({ demo: e.target.checked }) }}>Demo Account</Checkbox>
                                            </Form.Item>
                                            <Form.Item className="float-right">
                                                <Button type="primary" htmlType="submit" className="mx-3" onClick={() => { this.props.history.push('/admin-provider') }}>
                                                    Cancel
                                                </Button>
                                                <Button type="primary" className={this.state.update ? 'd-none' : ''} htmlType="submit" onClick={this.add_provider}>
                                                    Submit
                                                </Button>
                                                <Button type="primary" className={this.state.update ? '' : 'd-none'} htmlType="submit" onClick={this.update_provider}>
                                                    Update
                                                </Button>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                            </Form>
                        </Row>
                    </Content>
                </Layout>
            </Layout >
        );
    }
}

export default Form.create()(Add_Provider);
