import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Tweet from "@/components/Tweet";
import { ScrollArea } from "@/components/ui/scroll-area"
  
interface TweetModalProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tweets: any[];
    firstName: string;
    lastName: string;
    username: string;
    open: boolean;
    setOpen: (visible: boolean) => void;
}

const TweetModal = (props: TweetModalProps) => {
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tweets</DialogTitle>
        </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            <div className="flex flex-col border-l border-r border-b border-gray-125">
              {props.tweets.map((tweet, index) => (
                <Tweet
                  key={index}
                  tweet={tweet.tweet}
                  date={tweet.date}
                  firstName={props.firstName}
                  lastName={props.lastName}
                  username={props.username}
                />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
    </Dialog>
  )
}

export default TweetModal;