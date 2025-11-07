import {schema} from 'mongoose'; 

const meetingSchema=new Schema(
    {
        user_id:{
            type:String,
        },
        meeting_code:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            default:Date.now,
            required:true
        }
    }
)

const Meeting=mongoose.model("<eeting",meetingSchema);

export default Meeting;