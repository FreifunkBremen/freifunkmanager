package runtime

const (
	FREQ_THREASHOLD = 5000
)

type Channel struct {
	Frequency   uint32
	AllowedInEU bool
	DFS         bool
	Indoor      bool
	SDR         bool
}

var (
	ChannelEU = true

	ChannelList = map[uint32]*Channel{
		1:   &Channel{Frequency: 2412, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		2:   &Channel{Frequency: 2417, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		3:   &Channel{Frequency: 2422, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		4:   &Channel{Frequency: 2427, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		5:   &Channel{Frequency: 2432, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		6:   &Channel{Frequency: 2437, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		7:   &Channel{Frequency: 2442, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		8:   &Channel{Frequency: 2447, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		9:   &Channel{Frequency: 2452, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		10:  &Channel{Frequency: 2457, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		11:  &Channel{Frequency: 2462, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		12:  &Channel{Frequency: 2467, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		13:  &Channel{Frequency: 2472, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		14:  &Channel{Frequency: 2484, AllowedInEU: false, DFS: false, Indoor: false, SDR: false},
		32:  &Channel{Frequency: 5160, AllowedInEU: true, DFS: false, Indoor: false, SDR: false},
		34:  &Channel{Frequency: 5170, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		36:  &Channel{Frequency: 5180, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		38:  &Channel{Frequency: 5190, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		40:  &Channel{Frequency: 5200, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		42:  &Channel{Frequency: 5210, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		44:  &Channel{Frequency: 5220, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		46:  &Channel{Frequency: 5230, AllowedInEU: false, DFS: false, Indoor: true, SDR: false},
		48:  &Channel{Frequency: 5240, AllowedInEU: true, DFS: false, Indoor: true, SDR: false},
		50:  &Channel{Frequency: 5250, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		52:  &Channel{Frequency: 5260, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		54:  &Channel{Frequency: 5270, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		56:  &Channel{Frequency: 5280, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		58:  &Channel{Frequency: 5290, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		60:  &Channel{Frequency: 5300, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		62:  &Channel{Frequency: 5310, AllowedInEU: false, DFS: true, Indoor: true, SDR: false},
		64:  &Channel{Frequency: 5320, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		68:  &Channel{Frequency: 5340, AllowedInEU: true, DFS: true, Indoor: true, SDR: false},
		96:  &Channel{Frequency: 5480, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		100: &Channel{Frequency: 5500, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		102: &Channel{Frequency: 5510, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		104: &Channel{Frequency: 5520, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		106: &Channel{Frequency: 5530, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		108: &Channel{Frequency: 5540, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		110: &Channel{Frequency: 5550, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		112: &Channel{Frequency: 5560, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		114: &Channel{Frequency: 5570, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		116: &Channel{Frequency: 5580, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		118: &Channel{Frequency: 5590, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		120: &Channel{Frequency: 5600, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		122: &Channel{Frequency: 5610, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		124: &Channel{Frequency: 5620, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		126: &Channel{Frequency: 5630, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		128: &Channel{Frequency: 5640, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		132: &Channel{Frequency: 5660, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		134: &Channel{Frequency: 5670, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		136: &Channel{Frequency: 5680, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		138: &Channel{Frequency: 5690, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		140: &Channel{Frequency: 5700, AllowedInEU: true, DFS: true, Indoor: false, SDR: false},
		142: &Channel{Frequency: 5710, AllowedInEU: false, DFS: true, Indoor: false, SDR: false},
		144: &Channel{Frequency: 5720, AllowedInEU: true, DFS: true, Indoor: false, SDR: true},
		149: &Channel{Frequency: 5745, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		151: &Channel{Frequency: 5755, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		153: &Channel{Frequency: 5765, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		155: &Channel{Frequency: 5775, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		157: &Channel{Frequency: 5785, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		159: &Channel{Frequency: 5795, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		161: &Channel{Frequency: 5805, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		165: &Channel{Frequency: 5825, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		169: &Channel{Frequency: 5845, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
		173: &Channel{Frequency: 5865, AllowedInEU: true, DFS: false, Indoor: false, SDR: true},
	}
)

func ChannelIs5GHz(channel uint32) bool {
	ch, ok := ChannelList[channel]
	return ok && (!ChannelEU || ch.AllowedInEU) && ch.Frequency > FREQ_THREASHOLD
}

func GetChannel(channel uint32) *Channel {
	if ch, ok := ChannelList[channel]; ok {
		if !ChannelEU || ch.AllowedInEU {
			return ch
		}
	}
	return nil
}
func GetChannelByFrequency(freq uint32) (uint32, *Channel) {
	for ch, channel := range ChannelList {
		if channel.Frequency == freq {
			return ch, channel
		}
	}
	return 0, nil
}
