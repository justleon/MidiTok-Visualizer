from miditok import MusicTokenizer, TokenizerConfig

from core.service.tokenizers.cpword_tokenizer import CPWordTokenizer
from core.service.tokenizers.midilike_tokenizer import MIDILikeTokenizer
from core.service.tokenizers.MMM_tokenizer import MMMTokenizer
from core.service.tokenizers.muMIDI_tokenizer import MuMIDITokenizer
from core.service.tokenizers.octuple_tokenizer import OctupleTokenizer
from core.service.tokenizers.perTok_tokenizer import PerTokTokenizer
from core.service.tokenizers.remi_tokenizer import REMITokenizer
from core.service.tokenizers.structured_tokenizer import StructuredTokenizer
from core.service.tokenizers.tsd_tokenizer import TSDTokenizer


class TokenizerFactory:
    def get_tokenizer(self, tokenizer_type: str, config: TokenizerConfig) -> MusicTokenizer:
        match tokenizer_type:
            case "REMI":
                return REMITokenizer(config)
            case "MIDILike":
                return MIDILikeTokenizer(config)
            case "TSD":
                return TSDTokenizer(config)
            case "Structured":
                return StructuredTokenizer(config)
            case "CPWord":
                return CPWordTokenizer(config)
            case "Octuple":
                return OctupleTokenizer(config)
            case "MuMIDI":
                return MuMIDITokenizer(config)  # Not used by frontend
            case "MMM":
                return MMMTokenizer(config)  # Not used by frontend
            case "PerTok":
                return PerTokTokenizer(config)
            case _:
                raise ValueError(tokenizer_type)
