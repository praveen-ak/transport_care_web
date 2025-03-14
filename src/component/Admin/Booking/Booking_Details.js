import React,{Suspense} from "react";
import { withRouter } from "react-router";
import { client } from "../../../apollo";
import { Layout,Button, Empty,  Form, Card, Avatar, Row, Col, Rate,Skeleton } from 'antd';
import 'antd/dist/antd.css';
import '../../../scss/template.scss';
import { FaBarcode, FaDollarSign, FaRegImage, FaSignInAlt, FaSignOutAlt, FaUserAlt, FaUserCog, FaEye } from 'react-icons/fa';
import { AiFillTool, AiTwotoneBell, AiFillClockCircle, AiFillTags, AiTwotonePhone, AiTwotoneMail } from 'react-icons/ai';
import { GET_PARTICULAR_BOOKING } from '../../../graphql/User/booking';
import OwlCarousel from 'react-owl-carousel';
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { TiLocation } from 'react-icons/ti';
import AdminSider from '../Layout/AdminSider';
import AdminHeader from '../Layout/AdminHeader';
import Geocode from "react-geocode";
const { Content } = Layout;
const DescriptionValue = React.lazy(() => import('../../User/Book/DescriptionValue'));
class BookingDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            dataSource: [],
            update_data: {},
            update: 0,
            loading: false,
            loading_img: false,
            imageUrl: '',
            file: {},
            address: '',
            diffDuration: 0,
            previewVisible: false,
            previewImage: '',
            pagination: {
                pageSize: 10,
                current: 1,
                total: 0,
                simple: true,
            },
            message: [],
            booking: [],
            booking_user: [],
            booking_provider: [],
            booking_category: [],
            nav_text: ['', ''],
            u_rate:0,
            p_rate:0,
            responsive_first_category: {
                0: {
                    items: 1,
                },
                450: {
                    items: 2,
                },
                600: {
                    items: 3,
                },
                1000: {
                    items: 4,
                }
            },
        };
    }

    componentDidMount() {
        console.log(this.props.location.state);
        this.fetch_booking(this.props.location.state._id);
    }

    fetch_booking = (_id) => {
        client.query({
            query: GET_PARTICULAR_BOOKING,
            variables: { _id },
            fetchPolicy: 'no-cache',
        }).then(result => {
            // console.log(result);
            Geocode.setApiKey("AIzaSyCSU1q0Xi_lp-pgthdS370X33k3eza9Bu0");
            Geocode.enableDebug();
            Geocode.fromLatLng(result?.data?.booking[0]?.lat, result?.data?.booking[0]?.lng).then(
                response => {
                    // console.log(response.results);
                    this.setState({ address: response.results[0].formatted_address });
                },
                error => {
                    console.error(error);
                }
            );

            this.setState({
                booking: result.data.booking,
                booking_category: result.data.booking[0].booking_category,
                booking_user: result.data.booking[0].booking_user,
                booking_provider: result.data.booking[0].booking_provider,
                message: result.data.booking[0].get_booking_message,
                u_rate:result.data.booking[0].user_rating,
                p_rate:result.data.booking[0].provider_rating,
            })
        });
    }
    render() {
        console.log(this.state.u_rate);
        const { booking, booking_category, booking_provider, booking_user,u_rate } = this.state;
        console.log(this.props);
        return (
            <Layout style={{ height: '100vh' }}>
                <AdminSider update_collapsed={this.state.collapsed} />
                <Layout>
                    <AdminHeader />
                    <Content className="main_frame" style={{ background: 'none' }}>
                        <Row gutter={12}>
                            <Col lg={18} md={24}>
                                <Card bordered={0} title="Trip Detail" className="mb-3">
                                    <Row gutter={[12, 12]}>
                                        <Col span={12}>
                                            <div className="in_card"><FaBarcode className="mx-2" />Invoice no:{booking[0] ? booking[0].booking_ref : ''}</div>
                                        </Col>
                                        <Col span={12}>
                                            <div className="in_card justify-content-end d-flex">
                                                <Button type="link" target="=_blank" onClick={() => { this.props.history.push({ pathname: `/admin-booking-invoice/${booking[0] ? booking[0]._id : ''}` }) }}>Print Invoice</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]}>
                                        <Col span={24}>
                                            <div className="d-block in_card">
                                                <div className="">
                                                    <AiFillTool className="mx-3" /> Category:  {booking_category[0] ? booking_category[0].category_type === 1 ? booking_category[0].category_name : booking_category[0].subCategory_name : ''}
                                                </div>
                                                <div className="in_card_spilt">
                                               <Suspense fallback={<Skeleton active/>}>
                                                <DescriptionValue 
                                                    data={booking[0] ? booking[0].description : ""}
                                                    img={booking[0]?.user_image_url} />
                                               </Suspense>
                                                    {/* {booking[0] ? booking[0].description : ""} */}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]}>
                                        <Col span={24}>
                                            <div className="d-block in_card">
                                                <div>
                                                    <TiLocation className="mx-3" /> Location:
                                                </div>
                                                <div className="in_card_spilt">
                                                    {this.state.address}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]}>
                                        <Col md={12} sm={24}>
                                            <div className="d-block in_card">
                                                <div>
                                                    <AiTwotoneBell className="mx-3" /> Status:
                                                </div>
                                                <div className="in_card_spilt">
                                                    {
                                                        // booking==12,provider_cancel==8,provider_accept==9,user_accept==10,user_cancel==11,end==13,complete=14, 
                                                        booking.length > 0 ?
                                                            booking[0].booking_status === 10 ?
                                                                "User Accept" :
                                                                booking[0].booking_status === 8 ?
                                                                    "Provider Cancel" :
                                                                    booking[0].booking_status === 9 ?
                                                                        "Provider Accept" :
                                                                        booking[0].booking_status === 11 ?
                                                                            "User Cancel" :
                                                                            booking[0].booking_status === 13 ?
                                                                                "Job End" :
                                                                                booking[0].booking_status === 14 ?
                                                                                    "Job Complete" : '' : ''

                                                    }
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={12} sm={24}>
                                            <div className="d-block in_card">
                                                <div>
                                                    <AiFillClockCircle className="mx-3" /> Scheduled at:
                                                 </div>
                                                <div className="in_card_spilt">
                                                    {booking[0] ? booking[0].booking_date : ""}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                                <Card bordered={0} title="Initial Payment" className="mb-3">
                                    <Row gutter={[12, 12]}>
                                        <Col md={12} sm={24}>
                                            <div className="d-block in_card">
                                                <div>
                                                    <FaDollarSign className="mx-3" /> Amount
                                                 </div>
                                                <div className="in_card_spilt">
                                                    {booking[0] ? booking[0].base_price : ""}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={12} sm={24}>
                                            <div className="d-block in_card">
                                                <div>
                                                    <AiFillTags className="mx-3" />  Transaction Id
                                                 </div>
                                                <div className="in_card_spilt">
                                                    {booking[0] ? booking[0].charge_id : ""}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            
                                <Card bordered={0} title="Pricing Details" className="mb-3">
                                    {/* <Row gutter={[12, 12]}>
                                        <Col span={24}>
                                            <div className="d-flex in_card justify-content-between">
                                                <div>
                                                    Currency
                                                 </div>
                                                <div>
                                                    Category:
                                                </div>
                                            </div>
                                        </Col>
                                    </Row> */}
                                    <Row>
                                        <Col span={24}>
                                            <div className="d-flex in_card justify-content-between">
                                                <div>
                                                    Base Fare
                                                 </div>
                                                <div>
                                                    {booking[0] ? booking[0].base_price : ""}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]} className={booking[0]?.extra_price === undefined ? 'd-none':''}>
                                        <Col span={24}>
                                            <div className="d-flex in_card justify-content-between">
                                                <div>
                                                    Extra Fare
                                                 </div>
                                                <div>
                                                    {booking[0] ? booking[0].extra_price : ""}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row gutter={[12, 12]}>
                                        <Col span={24}>
                                            <div className="d-flex in_card justify-content-between">
                                                <div>
                                                    Total
                                                 </div>
                                                <div>
                                                    {booking[0] ? booking[0].total : ""}
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col lg={6} md={24}>
                                <Card bordered={0} className="mb-3" title="User" extra={<Avatar className='avatar_shadow' src={booking_user[0] ? booking_user[0].img_url : ''} />}>
                                    <div className="d-block">
                                        <div>
                                            <FaUserAlt className="mx-3" /> {booking_user[0] ? booking_user[0].name : ''}
                                        </div>
                                        <div>
                                            <AiTwotonePhone className="mx-3" /> {booking_user[0] ? booking_user[0].phone_number : ''}
                                        </div>
                                        <div>
                                            <AiTwotoneMail className="mx-3" /> {booking_user[0] ? booking_user[0].email : ''}
                                        </div>
                                    </div>
                                </Card>

                                <Card bordered={0} className="mb-3" title="Provider" extra={<Avatar className='avatar_shadow' src={booking_provider[0] ? booking_provider[0].img_url : ''} />}>
                                    <div className="d-block">
                                        <div>
                                            <FaUserCog className="mx-3" /> {booking_provider[0] ? booking_provider[0].name : ''}
                                        </div>
                                        <div>
                                            <AiTwotonePhone className="mx-3" />  {booking_provider[0] ? booking_provider[0].phone_number : ''}
                                        </div>
                                        <div>
                                            <AiTwotoneMail className="mx-3" /> {booking_provider[0] ? booking_provider[0].email : ''}
                                        </div>
                                    </div>
                                </Card>

                                <Card bordered={0} className="mb-3" title="Payout Information" extra={<FaEye style={{ fontSize: "2em", cursor: "pointer" }} />}>
                                    <div className="d-block">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                Total
                                            </div>
                                            <div>
                                                {booking[0] ? booking[0].total : ''}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                Service Fee
                                            </div>
                                            <div>
                                                {booking[0] ? booking[0].admin_fee : ''}
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                Provider Fee
                                            </div>
                                            <div>
                                                {booking[0] ? booking[0].provider_fee : ''}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex mt-3 justify-content-between align-items-center">
                                        <div>
                                            Payment Status :
                                        </div>
                                        <div className="blod primary_color card p-2">
                                            {booking[0] ? booking.length > 0 ?
                                                booking[0].payment_status === 0 ?
                                                    "Base Price Payout Pending" :
                                                    booking[0].payment_status === 1 ?
                                                        "Base Price Paid" :
                                                        booking[0].payment_status === 2 ?
                                                            "Refund Success" :
                                                            booking[0].payment_status === 3 ?
                                                                "Refund Failed" :
                                                                booking[0].payment_status === 4 ?
                                                                    "Final Payout Pending" :
                                                                    booking[0].payment_status === 5 ?
                                                                        "Payout Completed" : '' : '' : ''}
                                        </div>
                                    </div>
                                </Card>

                                <Card bordered={0} title="Messages" className="mb-3">
                                    <div className="border d-block" id="scroll" style={{ minHeight: "50vh", maxHeight: "50vh", overflowY: 'scroll' }}>
                                        {this.state.message.length > 0 ? <>
                                            {this.state.message.map(data => (
                                                <div className={data.role === 2 ? "d-flex m-3" : "d-flex m-3 flex-row-reverse"}>
                                                <Avatar size="large" src={ data.role === 1 ? booking_user[0]?.img_url :  booking_provider[0]?.img_url  } />
                                                    <div className="d-block mx-3">
                                                        <div className={data.role === 1 ? "d-flex flex-md-row-reverse" : ''}>
                                                            {data.message ? data.message !== null ? <card style={{
                                                                boxShadow: "#cccccc 0px 1px 5px 0px",
                                                                padding: "6px",
                                                                borderRadius: "7px"
                                                            }}>{data.message}</card> : " " : ''}
                                                        </div>
                                                        <div style={{
                                                            fontSize: "10px",
                                                            margin: "8px 0px"
                                                        }}>
                                                            {data.msg_date} {data.msg_time}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                            :
                                            <div style={{ marginTop: "25%" }}><div className="d-flex justify-content-center"><Empty description={false} /></div></div>}
                                    </div>
                                </Card>

                                <Card
                                    bordered={0}
                                    title="User Rating"
                                    className="mb-3"
                                    extra={<Rate disabled value={u_rate} />}>
                                    <div className="d-block">
                                        <p className="bold">
                                            Review
                                        </p>
                                        <p>
                                            {booking[0] ? booking[0].user_comments : ''}
                                        </p>
                                    </div>
                                </Card>

                                <Card
                                    bordered={0}
                                    title="Provider Rating"
                                    className="mb-3"
                                    extra={<Rate disabled value={this.state.p_rate} />}>
                                    <div className="d-block">
                                        <p className="bold">
                                            Review
                                        </p>
                                        <p>
                                            {booking[0] ? booking[0].provider_comments : ''}
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default Form.create()(withRouter(BookingDetails));