import { CheckCircleTwoTone } from "@ant-design/icons";
import "@/styles/components/Tweet.css";

interface TweetProps {
  tweet: string;
  date: string;
  firstName: string;
  lastName: string;
  username: string;
}

const Tweet = (props: TweetProps) => {
  return <>
    <div className="flex gap-2 bg-white p-4 rounded-lg shadow-md">
      <div className="min-w-10 min-h-10 w-10 h-10 rounded-full flex-shrink-0">
       <img
          src='/images/Rect_NonID_Grey.png'
          alt="X profile image"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="tweet-container">
        <div className="tweet-header">
          <h3 className="font-semibold">{`${props.firstName} ${props.lastName}`}</h3>
          <CheckCircleTwoTone twoToneColor="#1DA1F2"/>
          <div className="flex gap-x-2">
            <p className="text-gray-500 pt-0">{props.username}</p>
            <span className="text-gray-500">·</span>
            <p className="text-gray-500 text-sm pt-0">{new Date(props.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            })}
            </p>
          </div>
        </div>
        <p className="text-gray-800 pt-0">{props.tweet}</p>
      </div>
    </div>
  </>
}

export default Tweet;